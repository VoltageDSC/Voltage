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

import "./styles.css";

import { addContextMenuPatch, findGroupChildrenByChildId, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { ChannelStore, GuildMemberStore, GuildStore, Menu, UserStore } from "@webpack/common";
import { Guild, GuildMember } from "discord-types/general";

import openRolesAndUsersPermissionsModal, { PermissionType, RoleOrUserPermission } from "./components/RolesAndUsersPermissions";
import UserPermissions from "./components/UserPermissions";

export enum PermissionsSortOrder {
    HighestRole,
    LowestRole
}

export const settings = definePluginSettings({
    permissionsSortOrder: {
        description: "The sort method used for defining which role grants an user a certain permission",
        type: OptionType.SELECT,
        options: [
            { label: "Highest Role", value: PermissionsSortOrder.HighestRole, default: true },
            { label: "Lowest Role", value: PermissionsSortOrder.LowestRole }
        ],
    },
    defaultPermissionsDropdownState: {
        description: "Whether the permissions dropdown on user popouts should be open by default",
        type: OptionType.BOOLEAN,
        default: false,
    }
});

enum MenuItemParentType {
    User,
    Channel,
    Guild
}

function MenuItem(guildId: string, id?: string, type?: MenuItemParentType) {
    const guild = GuildStore.getGuild(guildId);

    const permissions: Array<RoleOrUserPermission> = [];
    let header: string;

    switch (type) {
        case MenuItemParentType.User: {
            const guildMember = GuildMemberStore.getMember(guildId, id!);

            const roles = [...guildMember.roles.map(roleId => guild.roles[roleId]), guild.roles[guild.id]];
            roles.sort(({ position: a }, { position: b }) => b - a);

            for (const role of roles) {
                permissions.push({
                    type: PermissionType.Role,
                    id: role.id,
                    permissions: role.permissions
                });
            }

            header = guildMember.nick ?? UserStore.getUser(guildMember.userId).username;

            break;
        }
        case MenuItemParentType.Channel: {
            const channel = ChannelStore.getChannel(id!);

            Object.values(channel.permissionOverwrites).forEach(overwrite => {
                permissions.push({
                    type: overwrite.type as PermissionType,
                    id: overwrite.id,
                    overwriteAllow: overwrite.allow,
                    overwriteDeny: overwrite.deny
                });
            });

            header = channel.name;

            break;
        }
        default: {
            Object.values(guild.roles).forEach(role => {
                permissions.push({
                    type: PermissionType.Role,
                    id: role.id,
                    permissions: role.permissions
                });
            });

            header = guild.name;

            break;
        }
    }

    return (
        <Menu.MenuItem
            id="perm-viewer-permissions"
            key="perm-viewer-permissions"
            label="Permissions"
            action={async () => openRolesAndUsersPermissionsModal(permissions, guild, header)}
        />
    );
}

function makeContextMenuPatch(childId: string, type?: MenuItemParentType): NavContextMenuPatchCallback {
    return (children, args) => {
        if (!args?.[0]) return children;

        const group = findGroupChildrenByChildId(childId, children);

        if (group && !group.some(child => child?.props?.id === "perm-viewer-permissions")) {
            switch (type) {
                case MenuItemParentType.User: {
                    group.push(MenuItem(args[0].guildId, args[0].user.id, type));
                    break;
                }
                case MenuItemParentType.Channel: {
                    group.push(MenuItem(args[0].guild.id, args[0].channel.id, type));
                    break;
                }
                case MenuItemParentType.Guild: {
                    group.push(MenuItem(args[0].guild.id));
                    break;
                }
            }
        }
    };
}

export default definePlugin({
    name: "Permissions Viewer",
    description: "View the permissions an user or channel has, and the roles of a server.",
    authors: [Devs.Sappy],
    settings,

    dependencies: ["Menu Item Deobfuscator API", "Context Menu API"],

    patches: [
        {
            find: ".Messages.BOT_PROFILE_SLASH_COMMANDS",
            replacement: {
                match: /showBorder:.{0,60}}\),(?<=guild:(\i),guildMember:(\i),.+?)/,
                replace: (m, guild, guildMember) => `${m}$self.UserPermissions(${guild},${guildMember}),`
            }
        }
    ],

    UserPermissions: (guild: Guild, guildMember: GuildMember) => <UserPermissions guild={guild} guildMember={guildMember} />,

    userContextMenuPatch: makeContextMenuPatch("roles", MenuItemParentType.User),
    channelContextMenuPatch: makeContextMenuPatch("mute-channel", MenuItemParentType.Channel),
    guildContextMenuPatch: makeContextMenuPatch("privacy", MenuItemParentType.Guild),

    start() {
        addContextMenuPatch("user-context", this.userContextMenuPatch);
        addContextMenuPatch("channel-context", this.channelContextMenuPatch);
        addContextMenuPatch("guild-context", this.guildContextMenuPatch);
    },

    stop() {
        removeContextMenuPatch("user-context", this.userContextMenuPatch);
        removeContextMenuPatch("channel-context", this.channelContextMenuPatch);
        removeContextMenuPatch("guild-context", this.guildContextMenuPatch);
    },
});
