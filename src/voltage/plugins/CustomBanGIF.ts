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
import definePlugin, { OptionType } from "@types";

export default definePlugin({
    name: "Custom Ban GIF",
    description: "Replaces the ban dialogue GIF with a custom one.",
    authors: [Devs.Sappy],
    patches: [
        {
            find: "BAN_CONFIRM_TITLE.",
            replacement: {
                match: /src:\w\(\d+\)/g,
                replace: "src: Voltage.Settings.plugins[\"Custom Ban GIF\"].source"
            }
        }
    ],
    options: {
        source: {
            description: "Source to replace ban GIF with (Video or Gif)",
            type: OptionType.STRING,
            default: "https://thumbs.gfycat.com/AssuredAcrobaticAchillestang-mobile.mp4",
            restartNeeded: true,
        }
    }
});
