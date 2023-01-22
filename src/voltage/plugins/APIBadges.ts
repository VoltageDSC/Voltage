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

import { BadgePosition, ProfileBadge } from "@api/Badges";
import { Devs } from "@constants";
import definePlugin from "@types";
import IpcEvents from "@utils/IPC";

const DEVELOPER_BADGE = "https://sappy.gq/Developer%20Badge.png";

const DeveloperIDs: string[] = Object.values(Devs).map(d => d.id.toString());

const DeveloperBadge: ProfileBadge = {
    tooltip: "Voltage Developer",
    image: DEVELOPER_BADGE,
    position: BadgePosition.END,
    props: {
        style: {
            borderRadius: "0%",
            transform: "scale(1.25)"
        }
    },
    shouldShow: ({ user }) => DeveloperIDs.includes(user.id),
    onClick: () => VoltageNative.ipc.invoke(IpcEvents.OPEN_EXTERNAL, "https://codeberg.org/Voltage/Voltage")
};

export default definePlugin({
    name: "Badge API",
    description: "API to add badges to users.",
    authors: [Devs.Sappy],
    required: true,
    patches: [
        {
            find: "PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP.format({date:",
            replacement: {
                match: /&&((\w{1,3})\.push\({tooltip:\w{1,3}\.\w{1,3}\.Messages\.PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP\.format.+?;)(?:return\s\w{1,3};?})/,
                replace: (_, m, badgeArray) => `&&${m} return Voltage.Api.Badges.inject(${badgeArray}, arguments[0]);}`,
            }
        },
        {
            find: "Messages.PROFILE_USER_BADGES,role:",
            replacement: [
                {
                    match: /src:(\w{1,3})\[(\w{1,3})\.key\],/,
                    replace: (_, imageMap, badge) => `src: ${badge}.image ?? ${imageMap}[${badge}.key], ...${badge}.props,`
                },
                {
                    match: /spacing:(\d{1,2}),children:(.{1,40}(.{1,2})\.jsx.+(.{1,2})\.onClick.+\)})},/,
                    replace: (_, s, origBadgeComponent, React, badge) =>
                        `spacing:${s},children:${badge}.component ? () => (0,${React}.jsx)(${badge}.component, { ...${badge} }) : ${origBadgeComponent}},`
                }
            ]
        }
    ],

    async start() {
        Voltage.Api.Badges.addBadge(DeveloperBadge);
    },
});
