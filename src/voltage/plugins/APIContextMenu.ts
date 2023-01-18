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

import { Devs } from "@constants";
import definePlugin from "@types";

const nameMap = {
    radio: "MenuRadioItem",
    separator: "MenuSeparator",
    checkbox: "MenuCheckboxItem",
    groupstart: "MenuGroup",

    control: "MenuControlItem",
    compositecontrol: "MenuControlItem",

    item: "MenuItem",
    customitem: "MenuItem",
};

export default definePlugin({
    name: "Context Menu API",
    description: "Deobfuscates Discord's Menu Item Module",
    authors: [Devs.Zach],
    required: true,
    patches: [
        {
            find: '"Menu API',
            replacement: {
                match: /function.{0,80}type===(.{1,3})\..{1,3}\).{0,50}navigable:.+?Menu API/s,
                replace: (m, mod) => {
                    let nicenNames = "";
                    const redefines = [] as string[];
                    const typeCheckRe = /\(.{1,3}\.type===(.{1,5})\)/g;
                    const pushTypeRe = /type:"(\w+)"/g;

                    let typeMatch: RegExpExecArray | null;
                    while ((typeMatch = typeCheckRe.exec(m)) !== null) {
                        const item = typeMatch[1];
                        pushTypeRe.lastIndex = typeCheckRe.lastIndex;
                        const type = pushTypeRe.exec(m)?.[1];
                        if (type && type in nameMap) {
                            const name = nameMap[type];
                            nicenNames += `Object.defineProperty(${item},"name",{value:"${name}"});`;
                            redefines.push(`${name}:${item}`);
                        }
                    }
                    if (redefines.length < 6) {
                        console.warn("[Context Menu API] Expected to at least remap 6 items, only remapped", redefines.length);
                    }

                    return `${nicenNames}Object.assign(${mod},{${redefines.join(",")}});${m}`;
                },
            },
        },
    ],
});

