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
import { PluginDef } from "@types";
import { LazyComponent } from "@utils/Misc";
import { ModalRoot, ModalSize, openModal } from "@utils/Modal";
import { find, findByCode, findByPropsLazy } from "@webpack";
import { Menu } from "@webpack/common";
import type { Guild } from "discord-types/general";

const ImageModal = LazyComponent(() => findByCode(".MEDIA_MODAL_CLOSE,"));
const MaskedLink = LazyComponent(() => find(m => m.type?.toString().includes("MASKED_LINK)")));

const GuildBannerStore = findByPropsLazy("getGuildBannerURL");

const OPEN_URL = "Voltage.Plugins.plugins[\"View Icons\"].openImage(";
export default new class ViewIcons implements PluginDef {
    name = "View Icons";
    authors = [Devs.Sappy];
    description = "Makes Avatars/Banners in user profiles clickable, and adds Guild Context Menu Entries to View Banner/Icon.";
    dependencies = ["Menu Item Deobfuscator API"];

    openImage(url: string) {
        const u = new URL(url);
        u.searchParams.set("size", "512");
        url = u.toString();

        openModal(modalProps => (
            <ModalRoot size={ModalSize.DYNAMIC} {...modalProps}>
                <ImageModal
                    shouldAnimate={true}
                    original={url}
                    src={url}
                    renderLinkComponent={MaskedLink}
                />
            </ModalRoot>
        ));
    }

    patches = [
        {
            find: "onAddFriend:",
            replacement: {
                // global because Discord has two components that are 99% identical with one small change ._.
                match: /\{src:(.{1,2}),avatarDecoration/g,
                replace: (_, src) => `{src:${src},onClick:()=>${OPEN_URL}${src}),avatarDecoration`
            }
        }, {
            find: ".popoutNoBannerPremium",
            replacement: {
                match: /style:.{0,10}\{\},(.{1,2})\)/,
                replace: (m, style) =>
                    `onClick:${style}.backgroundImage&&(${style}.cursor="pointer",` +
                    `()=>${OPEN_URL}${style}.backgroundImage.replace("url(", ""))),${m}`
            }
        }, {
            find: '"GuildContextMenu:',
            replacement: [
                {
                    match: /\w=(\w)\.id/,
                    replace: "_guild=$1,$&"
                },
                {
                    match: /(id:"leave-guild".{0,200}),(\(0,.{1,3}\.jsxs?\).{0,200}function)/,
                    replace: "$1,Voltage.Plugins.plugins[\"View Icons\"].buildGuildContextMenuEntries(_guild),$2"
                }
            ]
        }
    ];

    buildGuildContextMenuEntries(guild: Guild) {
        return (
            <Menu.MenuGroup>
                {guild.banner && (
                    <Menu.MenuItem
                        id="view-banner"
                        key="view-banner"
                        label="View Banner"
                        action={() => this.openImage(GuildBannerStore.getGuildBannerURL(guild))}
                    />
                )}
                {guild.icon && (
                    <Menu.MenuItem
                        id="view-icon"
                        key="view-icon"
                        label="View Icon"
                        action={() => this.openImage(guild.getIconURL(0, true))}
                    />
                )}
            </Menu.MenuGroup>
        );
    }
};
