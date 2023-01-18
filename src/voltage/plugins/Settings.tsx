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

import { Settings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import Logger from "@utils/Logger";
import { LazyComponent } from "@utils/Misc";

const SettingsComponent = LazyComponent(() => require("../components/settings").default);

export default definePlugin({
    name: "Settings UI",
    description: "Implements the Settings UI",
    authors: [Devs.Zach],
    required: true,
    patches: [{
        find: "Messages.ACTIVITY_SETTINGS",
        replacement: {
            get match() {
                switch (Settings.plugins["Settings UI"].settingsLocation) {
                    case "top": return /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.USER_SETTINGS\}/;
                    case "aboveNitro": return /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.BILLING_SETTINGS\}/;
                    case "belowNitro": return /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.APP_SETTINGS\}/;
                    case "aboveActivity": return /\{section:(.{1,2})\.ID\.HEADER,\s*label:(.{1,2})\..{1,2}\.Messages\.ACTIVITY_SETTINGS\}/;
                    case "belowActivity": return /(?<=\{section:(.{1,2})\.ID\.DIVIDER},)\{section:"changelog"/;
                    case "bottom": return /\{section:(.{1,2})\.ID\.CUSTOM,\s*element:.+?}/;
                    default: {
                        new Logger("Settings").error(
                            new Error("No switch case matched... Please Don't mess with settings.")
                        );
                        return /(?!a)a/;
                    }
                }
            },
            replace: (m, mod) => {
                const updater = !IS_WEB ? '{section:"Updater",label:"Updater",element:Voltage.Plugins.plugins["Settings UI"].tabs.updater},' : "";
                const patchHelper = IS_DEV ? '{section:"VoltagePatchHelper",label:"Patch Helper",element:Voltage.Components.PatchHelper},' : "";
                return (
                    `{section:${mod}.ID.HEADER,label:"Voltage"},` +
                    '{section:"Settings",label:"Settings",element:Voltage.Plugins.plugins["Settings UI"].tabs.settings},' +
                    '{section:"Plugins",label:"Plugins",element:Voltage.Plugins.plugins["Settings UI"].tabs.plugins},' +
                    '{section:"Themes",label:"Themes",element:Voltage.Plugins.plugins["Settings UI"].tabs.themes},' +
                    updater +
                    '{section:"SettingsSync",label:"Backup & Restore",element:Voltage.Plugins.plugins["Settings UI"].tabs.sync},' +
                    patchHelper +
                    `{section:${mod}.ID.DIVIDER},${m}`
                );
            }
        }
    }],

    options: {
        settingsLocation: {
            type: OptionType.SELECT,
            description: "Where do you want the Voltage Settings to be located?",
            options: [
                { label: "Very Top", value: "top" },
                { label: "Above Nitro Section", value: "aboveNitro" },
                { label: "Below Nitro Section", value: "belowNitro" },
                { label: "Above Activity Settings", value: "aboveActivity", default: true },
                { label: "Below Activity Settings", value: "belowActivity" },
                { label: "Very Bottom", value: "bottom" },
            ],
            restartNeeded: true
        },
    },

    tabs: {
        settings: () => <SettingsComponent tab="Settings" />,
        plugins: () => <SettingsComponent tab="Plugins" />,
        themes: () => <SettingsComponent tab="Themes" />,
        updater: () => <SettingsComponent tab="Updater" />,
        sync: () => <SettingsComponent tab="SettingsSync" />
    }
});
