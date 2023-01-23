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

import { ApplicationCommandInputType, sendBotMessage } from "@api/Commands";
import { Devs } from "@constants";
import definePlugin from "@types";
import { findByProps } from "@webpack";

export default definePlugin({
    name: "Friend Invites",
    description: "Generate and Manage Friend Invite Links.",
    authors: [Devs.Sappy],
    dependencies: ["Commands API"],
    commands: [
        {
            name: "create friend invite",
            description: "Generates a friend invite link.",
            inputType: ApplicationCommandInputType.BOT,
            execute: async (_, ctx) => {
                const friendInvites = findByProps("createFriendInvite");
                const createInvite = await friendInvites.createFriendInvite();

                return void sendBotMessage(ctx.channel.id, {
                    content: `
                        discord.gg/${createInvite.code}
                        Expires: <t:${new Date(createInvite.expires_at).getTime() / 1000}:R>
                        Max uses: \`${createInvite.max_uses}\`
                    `.trim().replace(/\s+/g, " ")
                });
            },
        },
        {
            name: "view friend invites",
            description: "View a list of all generated friend invites.",
            inputType: ApplicationCommandInputType.BOT,
            execute: async (_, ctx) => {
                const friendInvites = findByProps("createFriendInvite");
                const invites = await friendInvites.getAllFriendInvites();
                const friendInviteList = invites.map(i =>
                    `_discord.gg/${i.code}_
                    Expires: <t:${new Date(i.expires_at).getTime() / 1000}:R>
                    Times used: \`${i.uses}/${i.max_uses}\``.trim().replace(/\s+/g, " ")
                );

                return void sendBotMessage(ctx.channel.id, {
                    content: friendInviteList.join("\n\n") || "You have no active friend invites!"
                });
            },
        },
        {
            name: "revoke friend invites",
            description: "Revokes ALL generated friend invite links.",
            inputType: ApplicationCommandInputType.BOT,
            execute: async (_, ctx) => {
                await findByProps("createFriendInvite").revokeFriendInvites();

                return void sendBotMessage(ctx.channel.id, {
                    content: "All friend links have been revoked."
                });
            },
        },
    ]
});
