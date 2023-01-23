#!/usr/bin/node
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

import esbuild from "esbuild";

import { commonOpts, globPlugins, isStandalone, watch } from "./common.mjs";

const defines = {
    IS_STANDALONE: isStandalone,
    IS_DEV: JSON.stringify(watch)
};
if (defines.IS_STANDALONE === "false")
    defines["process.platform"] = JSON.stringify(process.platform);

/**
 * @type {esbuild.BuildOptions}
 */
const nodeCommonOpts = {
    ...commonOpts,
    format: "cjs",
    platform: "node",
    target: ["esnext"],
    minify: true,
    bundle: true,
    external: ["electron", ...commonOpts.external],
    define: defines,
};

await Promise.all([
    esbuild.build({
        ...nodeCommonOpts,
        entryPoints: ["src/core/preload/preload.ts"],
        outfile: "dist/preload.js",
    }),
    esbuild.build({
        ...nodeCommonOpts,
        entryPoints: ["src/core/patcher/patcher.ts"],
        outfile: "dist/patcher.js",
    }),
    esbuild.build({
        ...commonOpts,
        entryPoints: ["src/core/Voltage.ts"],
        outfile: "dist/renderer.js",
        format: "iife",
        target: ["esnext"],
        globalName: "Voltage",
        plugins: [
            globPlugins,
            ...commonOpts.plugins
        ],
        define: {
            ...defines,
            IS_WEB: false
        }
    }),
]).catch(err => {
    console.error("Build Failed");
    console.error(err.message);
    if (!commonOpts.watch)
        process.exitCode = 1;
});
