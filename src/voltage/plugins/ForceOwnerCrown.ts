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
import { GuildStore } from "@webpack/common";

export default definePlugin({
    name: "Force Owner Crown",
    description: "Forces the owner crown next to usernames even if the server is large.",
    authors: [Devs.Sappy],
    patches: [
        {
            // This is the logic where it decides whether to render the owner crown or not
            find: ".renderOwner=",
            replacement: {
                match: /isOwner;return null!=(\w+)?&&/g,
                replace: "isOwner;if(Voltage.Plugins.plugins[\"Force Owner Crown\"].isGuildOwner(this.props)){$1=true;}return null!=$1&&"
            }
        },
    ],
    isGuildOwner(props) {
        // Check if channel is a Group DM, if so return false
        if (props?.channel?.type === 3) {
            return false;
        }

        // guild id is in props twice, fallback if the first is undefined
        const guildId = props?.guildId ?? props?.channel?.guild_id;
        const userId = props?.user?.id;

        if (guildId && userId) {
            const guild = GuildStore.getGuild(guildId);
            if (guild) {
                return guild.ownerId === userId;
            }
            console.error("[Force Owner Crown] failed to get guild", { guildId, guild, props });
        } else {
            console.error("[Force Owner Crown] no guildId or userId", { guildId, userId, props });
        }
        return false;
    },
});
