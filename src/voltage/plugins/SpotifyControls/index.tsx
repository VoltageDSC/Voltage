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

import { Player } from "./components/PlayerComponent";

export default definePlugin({
    name: "Spotify Controls",
    description: "Adds a Control Panel while Listening to Spotify.",
    authors: [Devs.Zach],
    dependencies: ["Context Menu API"],
    patches: [
        {
            find: "showTaglessAccountPanel:",
            replacement: {
                match: /return ?(.{0,30}\(.{1,3},\{[^}]+?,showTaglessAccountPanel:.+?\}\))/,
                replace: "return [Voltage.Plugins.plugins[\"Spotify Controls\"].renderPlayer(),$1]"
            }
        },
        {
            find: ".PLAYER_DEVICES",
            replacement: {
                match: /get:(.{1,3})\.bind\(null,(.{1,6})\.get\)/,
                replace: "SpotifyAPIMarker:1,post:$1.bind(null,$2.post),$&"
            }
        },
        {
            find: 'repeat:"off"!==',
            replacement: {
                match: /repeat:"off"!==(.{1,3}),/,
                replace: "actual_repeat:$1,$&"
            }
        }
    ],

    renderPlayer: () => <Player />
});
