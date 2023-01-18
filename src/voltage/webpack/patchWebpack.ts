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

import { WEBPACK_CHUNK } from "@constants";
import { PatchReplacement } from "@types";
import Logger from "@utils/Logger";
import { canonicalizeReplacement } from "@utils/Patches";

import { _initWebpack } from ".";

let webpackChunk: any[];

const logger = new Logger("WebpackInterceptor", "#8caaee");

Object.defineProperty(window, WEBPACK_CHUNK, {
    get: () => webpackChunk,
    set: v => {
        if (v?.push !== Array.prototype.push) {
            logger.info(`Patching ${WEBPACK_CHUNK}.push`);
            _initWebpack(v);
            patchPush();
            // @ts-ignore
            delete window[WEBPACK_CHUNK];
            window[WEBPACK_CHUNK] = v;
        }
        webpackChunk = v;
    },
    configurable: true
});

function patchPush() {
    function handlePush(chunk: any) {
        try {
            const modules = chunk[1];
            const { subscriptions, listeners } = Voltage.Webpack;
            const { patches } = Voltage.Plugins;

            for (const id in modules) {
                let mod = modules[id];
                let code: string = mod.toString().replaceAll("\n", "");
                if (code.startsWith("function(")) {
                    code = "0," + code;
                }
                const originalMod = mod;
                const patchedBy = new Set();

                const factory = modules[id] = function (module, exports, require) {
                    try {
                        mod(module, exports, require);
                    } catch (err) {
                        if (mod === originalMod) throw err;

                        logger.error("Error in patched chunk", err);
                        return void originalMod(module, exports, require);
                    }

                    if (module.exports === window) {
                        Object.defineProperty(require.c, id, {
                            value: require.c[id],
                            enumerable: false,
                            configurable: true,
                            writable: true
                        });
                        return;
                    }

                    for (const callback of listeners) {
                        try {
                            callback(exports);
                        } catch (err) {
                            logger.error("Error in webpack listener", err);
                        }
                    }

                    for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);
                                callback(exports);
                            } else if (typeof exports === "object") {
                                if (exports.default && filter(exports.default)) {
                                    subscriptions.delete(filter);
                                    callback(exports.default);
                                }

                                for (const nested in exports) if (nested.length <= 3) {
                                    if (exports[nested] && filter(exports[nested])) {
                                        subscriptions.delete(filter);
                                        callback(exports[nested]);
                                    }
                                }
                            }
                        } catch (err) {
                            logger.error("Error while firing callback for webpack chunk", err);
                        }
                    }
                } as any as { toString: () => string, original: any, (...args: any[]): void; };

                try {
                    factory.toString = () => mod.toString();
                    factory.original = originalMod;
                } catch { }

                for (let i = 0; i < patches.length; i++) {
                    const patch = patches[i];
                    if (patch.predicate && !patch.predicate()) continue;

                    if (code.includes(patch.find)) {
                        patchedBy.add(patch.plugin);

                        for (const replacement of patch.replacement as PatchReplacement[]) {
                            if (replacement.predicate && !replacement.predicate()) continue;
                            const lastMod = mod;
                            const lastCode = code;

                            canonicalizeReplacement(replacement, patch.plugin);

                            try {
                                const newCode = code.replace(replacement.match, replacement.replace as string);
                                if (newCode === code && !patch.noWarn) {
                                    logger.warn(`Patch by ${patch.plugin} had no effect (Module id is ${id}): ${replacement.match}`);
                                    if (IS_DEV) {
                                        logger.debug("Function Source:\n", code);
                                    }
                                } else {
                                    code = newCode;
                                    mod = (0, eval)(`// Webpack Module ${id} - Patched by ${[...patchedBy].join(", ")}\n${newCode}\n//# sourceURL=WebpackModule${id}`);
                                }
                            } catch (err) {
                                logger.error(`Patch by ${patch.plugin} errored (Module id is ${id}): ${replacement.match}\n`, err);

                                if (IS_DEV) {
                                    const changeSize = code.length - lastCode.length;
                                    const match = lastCode.match(replacement.match)!;

                                    const start = Math.max(0, match.index! - 200);
                                    const end = Math.min(lastCode.length, match.index! + match[0].length + 200);
                                    const endPatched = end + changeSize;

                                    const context = lastCode.slice(start, end);
                                    const patchedContext = code.slice(start, endPatched);

                                    const diff = (require("diff") as typeof import("diff")).diffWordsWithSpace(context, patchedContext);
                                    let fmt = "%c %s ";
                                    const elements = [] as string[];
                                    for (const d of diff) {
                                        const color = d.removed
                                            ? "red"
                                            : d.added
                                                ? "lime"
                                                : "grey";
                                        fmt += "%c%s";
                                        elements.push("color:" + color, d.value);
                                    }

                                    logger.errorCustomFmt(...Logger.makeTitle("white", "Before"), context);
                                    logger.errorCustomFmt(...Logger.makeTitle("white", "After"), context);
                                    const [titleFmt, ...titleElements] = Logger.makeTitle("white", "Diff");
                                    logger.errorCustomFmt(titleFmt + fmt, ...titleElements, ...elements);
                                }
                                code = lastCode;
                                mod = lastMod;
                                patchedBy.delete(patch.plugin);
                            }
                        }

                        if (!patch.all) patches.splice(i--, 1);
                    }
                }
            }
        } catch (err) {
            logger.error("Error in handlePush", err);
        }

        return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
    }

    handlePush.original = window[WEBPACK_CHUNK].push;
    Object.defineProperty(window[WEBPACK_CHUNK], "push", {
        get: () => handlePush,
        set: v => (handlePush.original = v),
        configurable: true
    });
}
