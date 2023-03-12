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

import { Devs } from "@constants";
import definePlugin from "@types";

export default definePlugin({
    name: "Web Context Menus",
    description: "Adds missing context menu items on the Web Version of Discord",
    authors: [Devs.Sappy],
    enabledByDefault: true,

    patches: [{
        // There is literally no reason for Discord to make this Desktop only.
        // The only thing broken is copy, but they already have a different copy function
        // with web support????
        find: "open-native-link",
        replacement: [
            {
                // if (isNative || null ==
                match: /if\(!\w\..{1,3}\|\|null==/,
                replace: "if(null=="
            },
            // Fix silly Discord calling the non web support copy
            {
                match: /\w\.default\.copy/,
                replace: "Voltage.Webpack.Common.Clipboard.copy"
            }
        ]
    }]
});
