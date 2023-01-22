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

import { Devs } from "@constants";
import definePlugin from "@types";

const WEB_ONLY = (f: string) => () => {
    throw new Error(`'${f}' is Discord Desktop only.`);
};

export default definePlugin({
    name: "Console Shortcuts",
    description: "Adds shorter aliases for elements on the window. Run `shortcutList` for a list.",
    authors: [Devs.Zach],

    getShortcuts() {
        return {
            toClip: IS_WEB ? WEB_ONLY("toClip") : window.DiscordNative.clipboard.copy,
            fromClip: IS_WEB ? WEB_ONLY("fromClip") : window.DiscordNative.clipboard.read,
            wp: Voltage.Webpack,
            wpc: Voltage.Webpack.wreq.c,
            wreq: Voltage.Webpack.wreq,
            wpsearch: Voltage.Webpack.search,
            wpex: Voltage.Webpack.extract,
            wpexs: (code: string) => Voltage.Webpack.extract(Voltage.Webpack.findModuleId(code)!),
            findByProps: Voltage.Webpack.findByProps,
            find: Voltage.Webpack.find,
            Plugins: Voltage.Plugins,
            React: Voltage.Webpack.Common.React,
            Settings: Voltage.Settings,
            Api: Voltage.Api,
            reload: () => location.reload(),
            restart: IS_WEB ? WEB_ONLY("restart") : window.DiscordNative.app.relaunch
        };
    },

    start() {
        const shortcuts = this.getShortcuts();
        window.shortcutList = shortcuts;
        for (const [key, val] of Object.entries(shortcuts))
            window[key] = val;
    },

    stop() {
        delete window.shortcutList;
        for (const key in this.getShortcuts())
            delete window[key];
    }
});
