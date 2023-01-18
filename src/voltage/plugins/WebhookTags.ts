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
    name: "Webhook Tags",
    description: "Some Improvements for Bot tags, like the addition of Webhook tags.",
    authors: [Devs.Zach],
    patches: [
        {
            find: '.BOT=0]="BOT"',
            replacement: [
                {
                    match: /(.)\[.\.BOT=0\]="BOT";/,
                    replace: (orig, types) =>
                        `${types}[${types}.WEBHOOK=99]="WEBHOOK";${orig}`,
                },
                {
                    match: /case (.)\.BOT:default:(.)=/,
                    replace: (orig, types, text) =>
                        `case ${types}.WEBHOOK:${text}="WEBHOOK";break;${orig}`,
                },
            ],
        },
        {
            find: ".Types.ORIGINAL_POSTER",
            replacement: {
                match: /return null==(.)\?null:\(0,.{1,3}\.jsxs?\)\((.{1,3})\.Z/,
                replace: (orig, type, BotTag) =>
                    `if(arguments[0].message.webhookId&&arguments[0].user.isNonUserBot()){${type}=${BotTag}.Z.Types.WEBHOOK}${orig}`,
            },
        },
    ],
});
