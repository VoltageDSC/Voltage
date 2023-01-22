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
import { Clipboard, Toasts } from "@webpack/common";

export default definePlugin({
    name: "Better Role Dot",
    authors: [Devs.Zach],
    description: "Copy the role colour by clicking the Role Dot. Also allows using both the role dot and coloured names simultaneously",

    patches: [
        {
            find: "M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z",
            replacement: {
                match: /viewBox:"0 0 20 20"/,
                replace: "$&,onClick:()=>Voltage.Plugins.plugins[\"Better Role Dot\"].copyToClipBoard(e.color),style:{cursor:'pointer'}",
            },
        },
        {
            find: '"username"===',
            all: true,
            predicate: () => Settings.plugins["Better Role Dot"].bothStyles,
            replacement: {
                match: /"(?:username|dot)"===\w(?!\.\w)/g,
                replace: "true",
            },
        },
    ],

    options: {
        bothStyles: {
            type: OptionType.BOOLEAN,
            description: "Show both role dot and coloured names",
            default: false,
        }
    },

    copyToClipBoard(color: string) {
        Clipboard.copy(color);
        Toasts.show({
            message: "Copied to Clipboard!",
            type: Toasts.Type.SUCCESS,
            id: Toasts.genId(),
            options: {
                duration: 1000,
                position: Toasts.Position.BOTTOM
            }
        });
    },
});
