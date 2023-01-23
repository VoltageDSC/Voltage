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

export default definePlugin({
    name: "Better GIF Alt Text",
    authors: [Devs.Sappy],
    description: "Changes GIF Alt Text from being \"GIF\" to containing the gif tags/name",
    patches: [
        {
            find: "onCloseImage=",
            replacement: {
                match: /(return.{0,10}\.jsx.{0,50}isWindowFocused)/,
                replace:
                    "Voltage.Plugins.plugins[\"Better GIF Alt Text\"].altify(e);$1",
            },
        },
        {
            find: 'preload:"none","aria',
            replacement: {
                match: /(?<==(.{1,3})\.alt.{0,20})\?.{0,5}\.Messages\.GIF/,
                replace:
                    "?($1.alt='GIF',Voltage.Plugins.plugins[\"Better GIF Alt Text\"].altify($1))",
            },
        },
    ],

    altify(props: any) {
        if (props.alt !== "GIF") return props.alt;

        let url: string = props.original || props.src;
        try {
            url = decodeURI(url);
        } catch { }

        let name = url
            .slice(url.lastIndexOf("/") + 1)
            .replace(/\d/g, "") // strip numbers
            .replace(/.gif$/, "") // strip extension
            .split(/[,\-_ ]+/g)
            .slice(0, 20)
            .join(" ");
        if (name.length > 300) {
            name = name.slice(0, 300) + "...";
        }

        if (name) props.alt += ` - ${name}`;

        return props.alt;
    },
});
