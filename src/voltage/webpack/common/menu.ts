/*!
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


import { proxyLazy } from "@utils/ProxyLazy";

// eslint-disable-next-line path-alias/no-relative
import { filters, mapMangledModule, mapMangledModuleLazy } from "../webpack";
import type * as t from "./types/menu";

export const Menu: t.Menu = proxyLazy(() => {
    const hasDeobfuscator = Voltage.Settings.plugins["Menu Item Deobfuscator API"].enabled;
    const menuItems = ["MenuSeparator", "MenuGroup", "MenuItem", "MenuCheckboxItem", "MenuRadioItem", "MenuControlItem"];

    const map = mapMangledModule("♫ ⊂(｡◕‿‿◕｡⊂) ♪", {
        ContextMenu: filters.byCode("getContainerProps"),
        ...Object.fromEntries((hasDeobfuscator ? menuItems : []).map(s => [s, (m: any) => m.name === s]))
    }) as t.Menu;

    if (!hasDeobfuscator) {
        for (const m of menuItems)
            Object.defineProperty(map, m, {
                get() {
                    throw new Error("MenuItemDeobfuscator must be enabled to use this.");
                }
            });
    }

    return map;
});

export const ContextMenu: t.ContextMenuApi = mapMangledModuleLazy('type:"CONTEXT_MENU_OPEN"', {
    open: filters.byCode("stopPropagation"),
    openLazy: m => m.toString().length < 50,
    close: filters.byCode("CONTEXT_MENU_CLOSE")
});
