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

import { Settings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";

enum Methods {
    Random,
    Consistent,
    Timestamp,
}

export default definePlugin({
    name: "Anonymise File Names",
    authors: [Devs.Sappy],
    description: "Anonymises uploaded file names",
    patches: [
        {
            find: "instantBatchUpload:function",
            replacement: {
                match: /uploadFiles:(.{1,2}),/,
                replace:
                    "uploadFiles:(...args)=>(args[0].uploads.forEach(f=>f.filename=Voltage.Plugins.plugins[\"Anonymise File Names\"].anonymise(f.filename)),$1(...args)),",
            },
        },
    ],

    options: {
        method: {
            description: "Anonymising method",
            type: OptionType.SELECT,
            options: [
                { label: "Random Characters", value: Methods.Random, default: true },
                { label: "Consistent", value: Methods.Consistent },
                { label: "Timestamp (4chan-like)", value: Methods.Timestamp },
            ],
        },
        randomisedLength: {
            description: "Random characters length",
            type: OptionType.NUMBER,
            default: 7,
            disabled: () => Settings.plugins["Anonymise File Names"].method !== Methods.Random,
        },
        consistent: {
            description: "Consistent filename",
            type: OptionType.STRING,
            default: "image",
            disabled: () => Settings.plugins["Anonymise File Names"].method !== Methods.Consistent,
        },
    },

    anonymise(file: string) {
        let name = "image";
        const extIdx = file.lastIndexOf(".");
        const ext = extIdx !== -1 ? file.slice(extIdx) : "";

        switch (Settings.plugins["Anonymise File Names"].method) {
            case Methods.Random:
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                name = Array.from(
                    { length: Settings.plugins["Anonymise File Names"].randomisedLength },
                    () => chars[Math.floor(Math.random() * chars.length)]
                ).join("");
                break;
            case Methods.Consistent:
                name = Settings.plugins["Anonymise File Names"].consistent;
                break;
            case Methods.Timestamp:
                // UNIX timestamp in nanos, i could not find a better dependency-less way
                name = `${Math.floor(Date.now() / 1000)}${Math.floor(window.performance.now())}`;
                break;
        }
        return name + ext;
    },
});
