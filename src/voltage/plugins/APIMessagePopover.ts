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
    name: "Message Popover API",
    required: true,
    description: "API that adds buttons to Message Popovers",
    authors: [Devs.Sappy],
    patches: [{
        find: "Messages.MESSAGE_UTILITIES_A11Y_LABEL",
        replacement: {
            // foo && !bar ? createElement(blah,...makeElement(addReactionData))
            match: /(\i&&!\i)\?\(0,\i\.jsxs?\)\(.{0,20}renderPopout:.{0,300}?(\i)\(.{3,20}\{key:"add-reaction".+?\}/,
            replace: (m, bools, makeElement) => {
                const msg = m.match(/message:(.{1,3}),/)?.[1];
                if (!msg) throw new Error("Could not find message variable");
                return `...(${bools}?Voltage.Api.MessagePopover._buildPopoverElements(${msg},${makeElement}):[]),${m}`;
            }
        }
    }],
});
