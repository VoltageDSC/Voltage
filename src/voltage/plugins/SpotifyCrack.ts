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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";

const settings = definePluginSettings({
    noSpotifyAutoPause: {
        description: "Disable Spotify auto-pause",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    keepSpotifyActivityOnIdle: {
        description: "Keep Spotify activity playing when idling",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "Spotify Crack",
    description: "Free listen along, no auto-pausing in voice chat, and allows activity to continue playing when idling",
    authors: [Devs.Sappy],
    settings,

    patches: [
        {
            find: 'dispatch({type:"SPOTIFY_PROFILE_UPDATE"',
            replacement: {
                match: /SPOTIFY_PROFILE_UPDATE.+?isPremium:(?="premium"===(\i)\.body\.product)/,
                replace: (m, req) => `${m}(${req}.body.product="premium")&&`
            },
        },
        {
            find: '.displayName="SpotifyStore"',
            replacement: [
                {
                    predicate: () => settings.store.noSpotifyAutoPause,
                    match: /(?<=function \i\(\){)(?=.{0,200}SPOTIFY_AUTO_PAUSED\))/,
                    replace: "return;"
                },
                {
                    predicate: () => settings.store.keepSpotifyActivityOnIdle,
                    match: /(?<=shouldShowActivity=function\(\){.{0,50})&&!\i\.\i\.isIdle\(\)/,
                    replace: ""
                }
            ]
        }
    ]
});
