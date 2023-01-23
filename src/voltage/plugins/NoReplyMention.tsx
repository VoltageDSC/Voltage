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
import definePlugin, { OptionType } from "@types";

interface Reply {
    message: {
        author: {
            id: string;
        };
    };
}

export default definePlugin({
    name: "No Reply Mention",
    description: "Automatically sets replies to not mention target",
    authors: [Devs.Sappy],
    options: {
        exemptList: {
            description: "List of users to exempt from this plugin (separated by commas)",
            type: OptionType.STRING,
            default: "0",
        },
    },
    shouldMention(reply: Reply) {
        return Settings.plugins["No Reply Mention"].exemptList.includes(
            reply.message.author.id
        );
    },
    patches: [
        {
            find: "CREATE_PENDING_REPLY:function",
            replacement: {
                match: /CREATE_PENDING_REPLY:function\((.{1,2})\){/,
                replace:
                    "CREATE_PENDING_REPLY:function($1){$1.shouldMention=Voltage.Plugins.plugins[\"No Reply Mention\"].shouldMention($1);",
            },
        },
    ],
});
