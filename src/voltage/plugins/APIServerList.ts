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
    name: "Server List API",
    required: true,
    authors: [Devs.Sappy],
    description: "API required by plugins that Modify the Server List",
    patches: [
        {
            find: "Messages.DISCODO_DISABLED",
            replacement: {
                match: /(Messages\.DISCODO_DISABLED\);return)(.*?homeIcon.*?)(\}function)/,
                replace: "$1[$2].concat(Voltage.Api.ServerList.renderAll(Voltage.Api.ServerList.ServerListRenderPosition.Above))$3"
            }
        },
        {
            find: "Messages.SERVERS",
            replacement: {
                match: /(Messages\.SERVERS,children:)(.+?default:return null\}\}\)\))/,
                replace: "$1Voltage.Api.ServerList.renderAll(Voltage.Api.ServerList.ServerListRenderPosition.In).concat($2)"
            }
        }
    ]
});
