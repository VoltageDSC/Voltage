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

import { createHash } from "crypto";
import { createReadStream } from "fs";
import { join } from "path";

export async function calculateHashes() {
    const hashes = {} as Record<string, string>;

    await Promise.all(
        ["patcher.js", "preload.js", "renderer.js", "renderer.css"].map(file => new Promise<void>(r => {
            const fis = createReadStream(join(__dirname, file));
            const hash = createHash("sha1", { encoding: "hex" });
            fis.once("end", () => {
                hash.end();
                hashes[file] = hash.read();
                r();
            });
            fis.pipe(hash);
        }))
    );

    return hashes;
}

export function serializeErrors(func: (...args: any[]) => any) {
    return async function () {
        try {
            return {
                ok: true,
                value: await func(...arguments)
            };
        } catch (e: any) {
            return {
                ok: false,
                error: e instanceof Error ? {
                    ...e
                } : e
            };
        }
    };
}
