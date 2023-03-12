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

import { Player } from "./components/PlayerComponent";

function toggleHoverControls(value: boolean) {
    document.getElementById("voltage-spotify-hover-controls")?.remove();
    if (value) {
        const style = document.createElement("style");
        style.id = "voltage-spotify-hover-controls";
        style.textContent = `.voltage-spotify-button-row { height: 0; opacity: 0; will-change: height, opacity; transition: height .2s, opacity .05s; }
        .voltage-spotify-player:hover .voltage-spotify-button-row { opacity: 1; height: 32px; }`;
        document.head.appendChild(style);
    }
}

export default definePlugin({
    name: "Spotify Controls",
    description: "Adds a Control Panel while Listening to Spotify.",
    authors: [Devs.Sappy],
    dependencies: ["Menu Item Deobfuscator API"],
    options: {
        hoverControls: {
            description: "Show controls on hover",
            type: OptionType.BOOLEAN,
            default: false,
            onChange: v => toggleHoverControls(v)
        },
    },
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
    start: () => toggleHoverControls(Settings.plugins["Spotify Controls"].hoverControls),
    renderPlayer: () => <Player />
});
