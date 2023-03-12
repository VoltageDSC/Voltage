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
import { Devs } from "@constants";
import definePlugin from "@types";
import { addListener, removeListener } from "@webpack";

function listener(exports: any, id: number) {
    if (!Settings.plugins["Context Menu API"].enabled) return removeListener(listener);

    if (typeof exports !== "object" || exports === null) return;

    for (const key in exports) if (key.length <= 3) {
        const prop = exports[key];
        if (typeof prop !== "function") continue;

        const str = Function.prototype.toString.call(prop);
        if (str.includes('path:["empty"]')) {
            Voltage.Plugins.patches.push({
                plugin: "Context Menu API",
                all: true,
                noWarn: true,
                find: "navId:",
                replacement: [{
                    match: RegExp(`${id}(?<=(\\i)=.+?).+$`),
                    replace: (code, varName) => {
                        const regex = RegExp(`${key},{(?<=${varName}\\.${key},{)`, "g");
                        return code.replace(regex, "$&contextMenuApiArguments:arguments,");
                    }
                }]
            });

            removeListener(listener);
        }
    }
}

addListener(listener);

export default definePlugin({
    name: "Context Menu API",
    description: "API for adding/removing items to/from context menus.",
    authors: [Devs.Sappy],
    patches: [
        {
            find: "♫ (つ｡◕‿‿◕｡)つ ♪",
            replacement: {
                match: /(?<=function \i\((\i)\){)(?=var \i,\i=\i\.navId)/,
                replace: (_, props) => `Voltage.Api.ContextMenu._patchContextMenu(${props});`
            }
        }
    ]
});
