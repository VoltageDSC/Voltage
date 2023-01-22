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

import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { Devs } from "@constants";
import definePlugin from "@types";
import { Button, FluxDispatcher, GuildChannelStore, GuildStore, React, ReadStateStore } from "@webpack/common";

function onClick() {
    const channels: Array<any> = [];

    Object.values(GuildStore.getGuilds()).forEach(guild => {
        GuildChannelStore.getChannels(guild.id).SELECTABLE.forEach((c: { channel: { id: string; }; }) => {
            if (!ReadStateStore.hasUnread(c.channel.id)) return;

            channels.push({
                channelId: c.channel.id,
                // messageId: c.channel?.lastMessageId,
                messageId: ReadStateStore.lastMessageId(c.channel.id),
                readStateType: 0
            });
        });
    });

    FluxDispatcher.dispatch({
        type: "BULK_ACK",
        context: "APP",
        channels: channels
    });
}

const ReadAllButton = () => (
    <Button
        onClick={onClick}
        size={Button.Sizes.MIN}
        color={Button.Colors.BRAND}
        style={{ marginTop: "2px", marginBottom: "8px", marginLeft: "9px" }}
    >Read all</Button>
);

export default definePlugin({
    name: "Read All Notifications",
    description: "Adds a Clear Button to the Server List to clear all notifications.",
    authors: [Devs.Zach],
    dependencies: ["Server List API"],

    renderReadAllButton: () => <ReadAllButton />,

    start() {
        addServerListElement(ServerListRenderPosition.In, this.renderReadAllButton);
    },

    stop() {
        removeServerListElement(ServerListRenderPosition.In, this.renderReadAllButton);
    }
});
