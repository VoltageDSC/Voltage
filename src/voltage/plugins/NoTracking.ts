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
    name: "No Tracking",
    description: "Stops Discord from tracking everything you do like Sentry and Analytics.",
    authors: [Devs.Sappy],
    required: true,
    patches: [
        {
            find: "TRACKING_URL:",
            replacement: {
                match: /^.+$/,
                replace: "()=>{}",
            },
        },
        {
            find: "window.DiscordSentry=",
            replacement: {
                match: /window\.DiscordSentry=function.+\}\(\)/,
                replace: "",
            }
        },
        {
            find: ".METRICS,",
            replacement: [
                {
                    match: /this\._intervalId.+?12e4\)/,
                    replace: ""
                },
                {
                    match: /(?<=increment=function\(\i\){)/,
                    replace: "return;"
                }
            ]
        }
    ]
});
