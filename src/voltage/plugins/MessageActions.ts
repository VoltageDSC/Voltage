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

import { addClickListener, removeClickListener } from "@api/MessageEvents";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { findByPropsLazy, findLazy } from "@webpack";
import { UserStore } from "@webpack/common";

let isDeletePressed = false;
const keydown = (e: KeyboardEvent) => e.key === "Backspace" && (isDeletePressed = true);
const keyup = (e: KeyboardEvent) => e.key === "Backspace" && (isDeletePressed = false);

export default definePlugin({
    name: "Message Actions",
    description: "Hold Delete and Click to Delete, Double Click to Edit",
    authors: [Devs.Sappy],
    dependencies: ["Message Events API"],

    options: {
        enableDeleteOnClick: {
            type: OptionType.BOOLEAN,
            description: "Enable delete on click",
            default: true
        },
        enableDoubleClickToEdit: {
            type: OptionType.BOOLEAN,
            description: "Enable double click to edit",
            default: true
        }
    },

    start() {
        const MessageActions = findByPropsLazy("deleteMessage", "startEditMessage");
        const PermissionStore = findByPropsLazy("can", "initialize");
        const Permissions = findLazy(m => typeof m.MANAGE_MESSAGES === "bigint");
        const EditStore = findByPropsLazy("isEditing", "isEditingAny");

        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);

        this.onClick = addClickListener((msg, chan, event) => {
            const isMe = msg.author.id === UserStore.getCurrentUser().id;
            if (!isDeletePressed) {
                if (Voltage.Settings.plugins["Message Actions"].enableDoubleClickToEdit && (isMe && event.detail >= 2 && !EditStore.isEditing(chan.id, msg.id))) {
                    MessageActions.startEditMessage(chan.id, msg.id, msg.content);
                    event.preventDefault();
                }
            } else if (Voltage.Settings.plugins["Message Actions"].enableDeleteOnClick && (isMe || PermissionStore.can(Permissions.MANAGE_MESSAGES, chan))) {
                MessageActions.deleteMessage(chan.id, msg.id);
                event.preventDefault();
            }
        });
    },

    stop() {
        removeClickListener(this.onClick);
        document.removeEventListener("keydown", keydown);
        document.removeEventListener("keyup", keyup);
    }
});
