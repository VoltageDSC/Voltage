#!/usr/bin/node
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

import esbuild from "esbuild";
import { zip } from "fflate";
import { readFileSync } from "fs";
import { appendFile, mkdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";

import PackageJSON from "../../package.json" assert { type: "json" };
import { commonOpts, globPlugins, watch } from "./common.mjs";

/**
 * @type {esbuild.BuildOptions}
 */
const commonOptions = {
    ...commonOpts,
    entryPoints: ["browser/Voltage.ts"],
    globalName: "Voltage",
    format: "iife",
    external: ["plugins", "git-hash"],
    plugins: [
        globPlugins,
        ...commonOpts.plugins,
    ],
    target: ["esnext"],
    define: {
        IS_WEB: "true",
        IS_STANDALONE: "true",
        IS_DEV: JSON.stringify(watch)
    }
};

await Promise.all(
    [
        esbuild.build({
            ...commonOptions,
            outfile: "dist/browser.js",
            footer: { js: "//# sourceURL=VoltageWeb" },
        }),
        esbuild.build({
            ...commonOptions,
            inject: ["browser/GMPolyfill.js", ...(commonOptions?.inject || [])],
            define: {
                "window": "unsafeWindow",
                ...(commonOptions?.define)
            },
            outfile: "dist/Voltage.user.js",
            banner: {
                js: readFileSync("browser/userscript.meta.js", "utf-8").replace("%version%", `${PackageJSON.version}.${new Date().getTime()}`)
            },
            footer: {
                js: "Object.defineProperty(unsafeWindow,'Voltage',{get:()=>Voltage});"
            },
        })
    ]
);

/**
  * @type {(target: string, files: string[], shouldZip: boolean) => Promise<void>}
 */
async function buildPluginZip(target, files, shouldZip) {
    const entries = {
        "dist/Voltage.js": await readFile("dist/browser.js"),
        "dist/Voltage.css": await readFile("dist/browser.css"),
        ...Object.fromEntries(await Promise.all(files.map(async f => [
            (f.startsWith("manifest") ? "manifest.json" : f),
            await readFile(join("browser", f))
        ]))),
    };

    if (shouldZip) {
        return new Promise((resolve, reject) => {
            zip(entries, {}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const out = join("dist", target);
                    writeFile(out, data).then(() => {
                        console.info("Extension written to " + out);
                        resolve();
                    }).catch(reject);
                }
            });
        });
    } else {
        await rm(target, { recursive: true, force: true });
        await Promise.all(Object.entries(entries).map(async ([file, content]) => {
            const dest = join("dist", target, file);
            const parentDirectory = join(dest, "..");
            await mkdir(parentDirectory, { recursive: true });
            await writeFile(dest, content);
        }));

        console.info("Unpacked Extension Written to dist/" + target);
    }
}

const cssText = "`" + readFileSync("dist/Voltage.user.css", "utf-8").replaceAll("`", "\\`") + "`";
const cssRuntime = `
;document.addEventListener("DOMContentLoaded", () => document.documentElement.appendChild(
    Object.assign(document.createElement("style"), {
        textContent: ${cssText},
        id: "voltage-css-core"
    })
), { once: true });
`;

await Promise.all([
    appendFile("dist/Voltage.user.js", cssRuntime),
    buildPluginZip("Voltage-Chromium.zip", ["modifyResponseHeaders.json", "content.js", "manifestv3.json"], true),
]);

