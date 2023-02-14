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
import ErrorBoundary from "@components/errors/ErrorBoundary";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { findByCodeLazy } from "@webpack";
import { GuildMemberStore, React, RelationshipStore } from "@webpack/common";
import { User } from "discord-types/general";

const Avatar = findByCodeLazy(".Positions.TOP,spacing:");

const settings = definePluginSettings({
    showAvatars: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show avatars in the typing indicator"
    },
    showRoleColors: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show role colors in the typing indicator"
    },
    alternativeFormatting: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Show a more useful message when several users are typing"
    }
});

export default definePlugin({
    name: "Typing Tweaks",
    description: "Show avatars and role colours in the typing indicator",
    authors: [Devs.Sappy],
    patches: [
        // Style the indicator and add function call to modify the children before rendering
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /=(\i)\[2];(.+)"aria-atomic":!0,children:(\i)}\)/,
                replace: "=$1[2];$2\"aria-atomic\":!0,style:{display:\"grid\",gridAutoFlow:\"column\",gridGap:\"0.25em\"},children:$self.mutateChildren(this.props,$1,$3)})"
            }
        },
        // Changes the indicator to keep the user object when creating the list of typing users
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /return \i\.Z\.getName\(.,.\.props\.channel\.id,(.)\)/,
                replace: "return $1"
            }
        },
        // Adds the alternative formatting for several users typing
        {
            find: "getCooldownTextStyle",
            replacement: {
                match: /((\i)\.length\?.\..\.Messages\.THREE_USERS_TYPING.format\(\{a:(\i),b:(\i),c:.}\)):.+?SEVERAL_USERS_TYPING/,
                replace: "$1:$self.buildSeveralUsers({a:$3,b:$4,c:$2.length-2})"
            },
            predicate: () => settings.store.alternativeFormatting
        }
    ],
    settings,

    buildSeveralUsers({ a, b, c }: { a: string, b: string, c: number; }) {
        return [
            <strong key="0">{a}</strong>,
            ", ",
            <strong key="2">{b}</strong>,
            `, and ${c} others are typing...`
        ];
    },

    mutateChildren(props: any, users: User[], children: any) {
        if (!Array.isArray(children)) return children;

        let element = 0;

        return children.map(c => c.type === "strong" ? <this.TypingUser {...props} user={users[element++]} /> : c);
    },

    TypingUser: ErrorBoundary.wrap(({ user, guildId }: { user: User, guildId: string; }) => {
        return <strong style={{
            display: "grid",
            gridAutoFlow: "column",
            gap: "4px",
            color: settings.store.showRoleColors ? GuildMemberStore.getMember(guildId, user.id)?.colorString : undefined
        }}>
            {settings.store.showAvatars && <div style={{ marginTop: "4px" }}>
                <Avatar
                    size={Avatar.Sizes.SIZE_16}
                    src={user.getAvatarURL(guildId, 128)} />
            </div>}
            {GuildMemberStore.getNick(guildId!, user.id) || !guildId && RelationshipStore.getNickname(user.id) || user.username}
        </strong>;
    }, { noop: true })
});
