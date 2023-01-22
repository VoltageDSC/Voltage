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

import { Settings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { findByPropsLazy } from "@webpack";

const RelationshipStore = findByPropsLazy("getRelationships", "isBlocked");

export default definePlugin({
    name: "No Blocked Messages",
    description: "Hides all blocked messages from chat completely.",
    authors: [Devs.Zach],
    patches: [
        {
            find: 'safety_prompt:"DMSpamExperiment",response:"show_redacted_messages"',
            replacement: [
                {
                    match: /\.collapsedReason;return/,
                    replace: ".collapsedReason;return null;return;"
                }
            ]
        },
        {
            find: "displayName=\"MessageStore\"",
            predicate: () => Settings.plugins["No Blocked Messages"].ignoreBlockedMessages === true,
            replacement: [
                {
                    match: /(?<=MESSAGE_CREATE:function\((\w)\){var \w=\w\.channelId,\w=\w\.message,\w=\w\.isPushNotification,\w=\w\.\w\.getOrCreate\(\w\));/,
                    replace: ";if(Voltage.Plugins.plugins[\"No Blocked Messages\"].isBlocked(n))return;"
                }
            ]
        }
    ],
    options: {
        ignoreBlockedMessages: {
            description: "Completely ignores (recent) incoming messages from blocked users (locally).",
            type: OptionType.BOOLEAN,
            default: false,
            restartNeeded: true,
        },
    },
    isBlocked: message =>
        RelationshipStore.isBlocked(message.author.id)
});
