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

import { addPreSendListener, MessageObject, removePreSendListener } from "@api/MessageEvents";
import { Devs } from "@constants";
import definePlugin from "@types";

const re = /https?:\/\/twitter\.com(?=\/\w+?\/status\/)/g;

export default definePlugin({
    name: "FxTwitter",
    description: "Uses FxTwitter to Improve Twitter Embeds on send.",
    authors: [Devs.Sappy],
    dependencies: ["Message Events API"],

    addPrefix(msg: MessageObject) {
        msg.content = msg.content.replace(re, "https://fxtwitter.com");
    },

    start() {
        this.preSend = addPreSendListener((_, msg) => this.addPrefix(msg));
    },

    stop() {
        removePreSendListener(this.preSend);
    }
});
