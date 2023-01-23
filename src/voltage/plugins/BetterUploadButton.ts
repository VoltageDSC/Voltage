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
    name: "Better Upload Button",
    authors: [Devs.Sappy],
    description: "Allows you to upload with a single click, and open the menu with right click",
    patches: [
        {
            find: "Messages.CHAT_ATTACH_UPLOAD_OR_INVITE",
            replacement: {
                // Discord merges multiple props here with Object.assign()
                // This patch passes a third object to it with which we override onClick and onContextMenu
                match: /CHAT_ATTACH_UPLOAD_OR_INVITE,onDoubleClick:(.+?:void 0)\},(.{1,3})\)/,
                replace: (m, onDblClick, otherProps) =>
                    `${m.slice(0, -1)},{onClick:${onDblClick},onContextMenu:${otherProps}.onClick})`,
            },
        },
    ],
});
