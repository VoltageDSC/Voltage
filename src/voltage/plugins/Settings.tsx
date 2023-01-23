/*
 * Voltage, A lightweight client mod focused on being better with themes.
 * Copyright (c) 2023 Sappy and Contributors
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
import PatchHelper from "@components/patcher/PatchHelper";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import Logger from "@utils/Logger";
import { LazyComponent } from "@utils/Misc";
import { Router } from "@webpack/common";

const SettingsComponent = LazyComponent(() => require("../components/settings").default);

export default definePlugin({
    name: "Settings",
    description: "Implements the Settings UI",
    authors: [Devs.Sappy],
    required: true,
    patches: [{
        find: "Messages.ACTIVITY_SETTINGS",
        replacement: {
            get match() {
                switch (Settings.plugins.Settings.settingsLocation) {
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
            replace: "...$self.makeSettingsCategories($1),$&"
        }
    }],

    makeSettingsCategories({ ID }: { ID: Record<string, unknown>; }) {
        const makeOnClick = (tab: string) => () => Router.open(tab);

        const cats = [
            {
                section: ID.HEADER,
                label: "Voltage"
            }, {
                section: "VoltageSettings",
                label: "Settings",
                element: () => <SettingsComponent tab="VoltageSettings" />,
                onClick: makeOnClick("VoltageSettings")
            }, {
                section: "VoltagePlugins",
                label: "Plugins",
                element: () => <SettingsComponent tab="VoltagePlugins" />,
                onClick: makeOnClick("VoltagePlugins")
            }, {
                section: "VoltageThemes",
                label: "Themes",
                element: () => <SettingsComponent tab="VoltageThemes" />,
                onClick: makeOnClick("VoltageThemes")
            }
        ] as Array<{
            section: unknown,
            label?: string;
            element?: React.ComponentType;
            onClick?(): void;
        }>;

        if (!IS_WEB)
            cats.push({
                section: "VoltageUpdater",
                label: "Updater",
                element: () => <SettingsComponent tab="VoltageUpdater" />,
                onClick: makeOnClick("VoltageUpdater")
            });

        cats.push({
            section: "VoltageSettingsSync",
            label: "Backup & Restore",
            element: () => <SettingsComponent tab="VoltageSettingsSync" />,
            onClick: makeOnClick("VoltageSettingsSync")
        });

        if (IS_DEV)
            cats.push({
                section: "VoltagePatchHelper",
                label: "Patch Helper",
                element: PatchHelper!,
                onClick: makeOnClick("VoltagePatchHelper")
            });

        cats.push({ section: ID.DIVIDER });

        return cats;
    },

    options: {
        settingsLocation: {
            type: OptionType.SELECT,
            description: "Where to put the Voltage settings section",
            options: [
                { label: "At the very top", value: "top" },
                { label: "Above the Nitro section", value: "aboveNitro" },
                { label: "Below the Nitro section", value: "belowNitro" },
                { label: "Above Activity Settings", value: "aboveActivity", default: true },
                { label: "Below Activity Settings", value: "belowActivity" },
                { label: "At the very bottom", value: "bottom" },
            ],
            restartNeeded: true
        },
    },

    tabs: {
        settings: () => <SettingsComponent tab="VoltageSettings" />,
        plugins: () => <SettingsComponent tab="VoltagePlugins" />,
        themes: () => <SettingsComponent tab="VoltageThemes" />,
        updater: () => <SettingsComponent tab="VoltageUpdater" />,
        sync: () => <SettingsComponent tab="VoltageSettingsSync" />
    },
});
