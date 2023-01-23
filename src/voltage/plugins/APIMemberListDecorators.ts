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
    name: "Member List Decorators API",
    required: true,
    description: "API that adds decorators to the Server / DMs Member List",
    authors: [Devs.Sappy],
    patches: [
        {
            find: "lostPermissionTooltipText,",
            replacement: {
                match: /Fragment,{children:\[(.{30,80})\]/,
                replace: "Fragment,{children:Voltage.Api.MemberListDecorators.__addDecoratorsToList(this.props).concat($1)"
            }
        },
        {
            find: "PrivateChannel.renderAvatar",
            replacement: {
                match: /(subText:(.{1,2})\.renderSubtitle\(\).{1,50}decorators):(.{30,100}:null)/,
                replace: "$1:Voltage.Api.MemberListDecorators.__addDecoratorsToList($2.props).concat($3)"
            }
        }
    ],
});
