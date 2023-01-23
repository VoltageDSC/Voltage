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
import { makeLazy } from "@utils/Misc";

export default definePlugin({
    name: "Better Notes",
    description: "Allows you to hide notes or disable spellcheck",
    authors: [Devs.Sappy],

    patches: [
        {
            find: "hideNote:",
            all: true,
            predicate: makeLazy(() => Voltage.Settings.plugins["Better Notes"].hide),
            replacement: {
                match: /hideNote:.+?(?=[,}])/g,
                replace: "hideNote:true",
            }
        }, {
            find: "Messages.NOTE_PLACEHOLDER",
            replacement: {
                match: /\.NOTE_PLACEHOLDER,/,
                replace: "$&spellCheck:!Voltage.Settings.plugins[\"Better Notes\"].noSpellCheck,"
            }
        }
    ],

    options: {
        hide: {
            type: OptionType.BOOLEAN,
            description: "Hide notes",
            default: false,
            restartNeeded: true
        },
        noSpellCheck: {
            type: OptionType.BOOLEAN,
            description: "Disable spellcheck in notes",
            disabled: () => Settings.plugins["Better Notes"].hide,
            default: false
        }
    }
});
