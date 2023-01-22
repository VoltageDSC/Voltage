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

export default definePlugin({
    name: "Commands API",
    required: true,
    authors: [Devs.Zach],
    description: "API required by plugins that use Slash Commands",
    patches: [
        // obtain BUILT_IN_COMMANDS instance
        {
            find: '"giphy","tenor"',
            replacement: [
                {
                    // Matches BUILT_IN_COMMANDS. This is not exported so this is
                    // the only way. _init() just returns the same object to make the
                    // patch simpler

                    // textCommands = builtInCommands.filter(...)
                    match: /(?<=\w=)(\w)(\.filter\(.{0,30}giphy)/,
                    replace: "Voltage.Api.Commands._init($1)$2",
                }
            ],
        },
        // command error handling
        {
            find: "Unexpected value for option",
            replacement: {
                // return [2, cmd.execute(args, ctx)]
                match: /,(.{1,2})\.execute\((.{1,2}),(.{1,2})\)]/,
                replace: (_, cmd, args, ctx) => `,Voltage.Api.Commands._handleCommand(${cmd}, ${args}, ${ctx})]`
            }
        },
        // Show plugin name instead of "Built-In"
        {
            find: ".source,children",
            replacement: {
                // ...children: p?.name
                match: /(?<=:(.{1,3})\.displayDescription\}.{0,200}\.source,children:)[^}]+/,
                replace: "$1.plugin||($&)"
            }
        }
    ],
});
