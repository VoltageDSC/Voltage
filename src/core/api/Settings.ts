/*
 * Voltage, A lightweight client mod focused on being better with themes.
 * Copyright (c) 2023 Zach J Murphy and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { DefinedSettings, OptionType, SettingsChecks, SettingsDefinition } from "@types";
import IpcEvents from "@utils/IPC";
import Logger from "@utils/Logger";
import { mergeDefaults } from "@utils/Misc";
import { React } from "@webpack/common";

import plugins from "~plugins";

const logger = new Logger("Settings");
export interface Settings {
    ShowToasts: boolean;
    CustomCSS: boolean;
    ReactDevTools: boolean;
    themeLinks: string[];
    frameless: boolean;
    plugins: {
        [plugin: string]: {
            enabled: boolean;
            [setting: string]: any;
        };
    };
}

const DefaultSettings: Settings = {
    ShowToasts: true,
    CustomCSS: true,
    themeLinks: [],
    ReactDevTools: false,
    frameless: false,
    plugins: {}
};

try {
    var settings = JSON.parse(VoltageNative.ipc.sendSync(IpcEvents.GET_SETTINGS)) as Settings;
    mergeDefaults(settings, DefaultSettings);
} catch (err) {
    var settings = mergeDefaults({} as Settings, DefaultSettings);
    logger.error("An error occurred while loading the settings. Corrupt Settings File?\n", err);
}

type SubscriptionCallback = ((newValue: any, path: string) => void) & { _path?: string; };
const subscriptions = new Set<SubscriptionCallback>();

const proxyCache = {} as Record<string, any>;

function makeProxy(settings: any, root = settings, path = ""): Settings {
    return proxyCache[path] ??= new Proxy(settings, {
        get(target, p: string) {
            const v = target[p];

            if (!(p in target)) {
                if (path === "plugins" && p in plugins)
                    return target[p] = makeProxy({
                        enabled: plugins[p].required ?? false
                    }, root, `plugins.${p}`);

                if (path.startsWith("plugins.")) {
                    const plugin = path.slice("plugins.".length);
                    if (plugin in plugins) {
                        const setting = plugins[plugin].options?.[p];
                        if (!setting) return v;
                        if ("default" in setting)
                            return (target[p] = setting.default);
                        if (setting.type === OptionType.SELECT) {
                            const def = setting.options.find(o => o.default);
                            if (def)
                                target[p] = def.value;
                            return def?.value;
                        }
                    }
                }
                return v;
            }

            if (typeof v === "object" && !Array.isArray(v) && v !== null)
                return makeProxy(v, root, `${path}${path && "."}${p}`);

            return v;
        },

        set(target, p: string, v) {
            if (target[p] === v) return true;

            target[p] = v;
            const setPath = `${path}${path && "."}${p}`;
            for (const subscription of subscriptions) {
                if (!subscription._path || subscription._path === setPath) {
                    subscription(v, setPath);
                }
            }

            VoltageNative.ipc.invoke(IpcEvents.SET_SETTINGS, JSON.stringify(root, null, 4));
            return true;
        }
    });
}

/**
 * Same as {@link Settings} but unproxied. You should treat this as readonly,
 * as modifying properties on this will not save to disk or call settings
 * listeners.
 * WARNING: default values specified in plugin.options will not be ensured here. In other words,
 * settings for which you specified a default value may be uninitialised. If you need proper
 * handling for default values, use {@link Settings}
 */
export const PlainSettings = settings;
/**
 * A smart settings object. Altering props automagically saves
 * the updated settings to disk.
 * This recursively proxies objects. If you need the object non proxied, use {@link PlainSettings}
 */
export const Settings = makeProxy(settings);

/**
 * Settings hook for React components. Returns a smart settings
 * object that automagically triggers a rerender if any properties
 * are altered
 * @param paths An optional list of paths to whitelist for rerenders
 * @returns Settings
 */
export function useSettings(paths?: string[]) {
    const [, forceUpdate] = React.useReducer(() => ({}), {});

    const onUpdate: SubscriptionCallback = paths
        ? (value, path) => paths.includes(path) && forceUpdate()
        : forceUpdate;

    React.useEffect(() => {
        subscriptions.add(onUpdate);
        return () => void subscriptions.delete(onUpdate);
    }, []);

    return Settings;
}

type ResolvePropDeep<T, P> = P extends "" ? T :
    P extends `${infer Pre}.${infer Suf}` ?
    Pre extends keyof T ? ResolvePropDeep<T[Pre], Suf> : never : P extends keyof T ? T[P] : never;

/**
 * Add a settings listener that will be invoked whenever the desired setting is updated
 * @param path Path to the setting that you want to watch, for example "plugins.Unindent.enabled" will fire your callback
 *             whenever Unindent is toggled. Pass an empty string to get notified for all changes
 * @param onUpdate Callback function whenever a setting matching path is updated. It gets passed the new value and the path
 *                 to the updated setting. This path will be the same as your path argument, unless it was an empty string.
 *
 * @example addSettingsListener("", (newValue, path) => console.log(`${path} is now ${newValue}`))
 *          addSettingsListener("plugins.Unindent.enabled", v => console.log("Unindent is now", v ? "enabled" : "disabled"))
 */
export function addSettingsListener<Path extends keyof Settings>(path: Path, onUpdate: (newValue: Settings[Path], path: Path) => void): void;
export function addSettingsListener<Path extends string>(path: Path, onUpdate: (newValue: Path extends "" ? any : ResolvePropDeep<Settings, Path>, path: Path extends "" ? string : Path) => void): void;
export function addSettingsListener(path: string, onUpdate: (newValue: any, path: string) => void) {
    (onUpdate as SubscriptionCallback)._path = path;
    subscriptions.add(onUpdate);
}

export function migratePluginSettings(name: string, ...oldNames: string[]) {
    const { plugins } = settings;
    if (name in plugins) return;

    for (const oldName of oldNames) {
        if (oldName in plugins) {
            logger.info(`Migrating settings from old name ${oldName} to ${name}`);
            plugins[name] = plugins[oldName];
            delete plugins[oldName];
            VoltageNative.ipc.invoke(
                IpcEvents.SET_SETTINGS,
                JSON.stringify(settings, null, 4)
            );
            break;
        }
    }
}

export function definePluginSettings<D extends SettingsDefinition, C extends SettingsChecks<D>>(def: D, checks?: C) {
    const definedSettings: DefinedSettings<D> = {
        get store() {
            if (!definedSettings.pluginName) throw new Error("Cannot access settings before plugin is initialized");
            return Settings.plugins[definedSettings.pluginName] as any;
        },
        use: settings => useSettings(
            settings?.map(name => `plugins.${definedSettings.pluginName}.${name}`)
        ).plugins[definedSettings.pluginName] as any,
        def,
        checks: checks ?? {},
        pluginName: "",
    };
    return definedSettings;
}
