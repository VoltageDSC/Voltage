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
    name: "Message Events API",
    description: "API required by plugins using Message Events.",
    authors: [Devs.Sappy],
    required: true,
    patches: [
        {
            find: "sendMessage:function",
            replacement: [{
                match: /(?<=_sendMessage:function\([^)]+\)){/,
                replace: "{if(Voltage.Api.MessageEvents._handlePreSend(...arguments)){return;};"
            }, {
                match: /(?<=\beditMessage:function\([^)]+\)){/,
                replace: "{Voltage.Api.MessageEvents._handlePreEdit(...arguments);"
            }]
        },
        {
            find: '("interactionUsernameProfile',
            replacement: {
                match: /var \w=(\w)\.id,\w=(\w)\.id;return .{1,2}\.useCallback\(\(?function\((.{1,2})\){/,
                replace: (m, message, channel, event) =>
                    `var _msg=${message},_chan=${channel};${m}Voltage.Api.MessageEvents._handleClick(_msg, _chan, ${event});`
            }
        }
    ]
});
