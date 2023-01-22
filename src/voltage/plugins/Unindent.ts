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

import { addPreEditListener, addPreSendListener, MessageObject, removePreEditListener, removePreSendListener } from "@api/MessageEvents";
import { Devs } from "@constants";
import definePlugin from "@types";

export default definePlugin({
    name: "Unindent",
    description: "Trims leading indentation from codeblocks",
    authors: [Devs.Zach],
    dependencies: ["Message Events API"],
    patches: [
        {
            find: "inQuote:",
            replacement: {
                match: /,content:([^,]+),inQuote/,
                replace: (_, content) => `,content:Voltage.Plugins.plugins.Unindent.unindent(${content}),inQuote`
            }
        }
    ],

    unindent(str: string) {
        // Users cannot send tabs, they get converted to spaces. However, a bot may send tabs, so convert them to 4 spaces first
        str = str.replace(/\t/g, "    ");
        const minIndent = str.match(/^ *(?=\S)/gm)
            ?.reduce((prev, curr) => Math.min(prev, curr.length), Infinity) ?? 0;

        if (!minIndent) return str;
        return str.replace(new RegExp(`^ {${minIndent}}`, "gm"), "");
    },

    unindentMsg(msg: MessageObject) {
        msg.content = msg.content.replace(/```(.|\n)*?```/g, m => {
            const lines = m.split("\n");
            if (lines.length < 2) return m; // Do not affect inline codeblocks
            let suffix = "";
            if (lines[lines.length - 1] === "```") suffix = lines.pop()!;
            return `${lines[0]}\n${this.unindent(lines.slice(1).join("\n"))}\n${suffix}`;
        });
    },

    start() {
        this.preSend = addPreSendListener((_, msg) => this.unindentMsg(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) => this.unindentMsg(msg));
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    }
});
