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

import { onceDefined } from "@utils/OnceDefined";
import electron, { app, BrowserWindowConstructorOptions } from "electron";
import { readFileSync } from "fs";
import { dirname, join } from "path";

import { initIpc } from "../ipc";
import { installExt } from "../ipc/extensions";
import { readSettings } from "../ipc/index";

console.log("[Voltage] Starting Up...");

const injectorPath = require.main!.filename;
const asarName = require.main!.path.endsWith("app.asar") ? "_app.asar" : "app.asar";

const asarPath = join(dirname(injectorPath), "..", asarName);

const discordPkg = require(join(asarPath, "package.json"));
require.main!.filename = join(asarPath, discordPkg.main);

// @ts-ignore
app.setAppPath(asarPath);

if (!process.argv.includes("--vanilla")) {
    if (process.platform === "win32") {
        require("./patchWin32Updater");
    }

    let settings = {} as any;
    try {
        settings = JSON.parse(readSettings());
    } catch { }

    class BrowserWindow extends electron.BrowserWindow {
        constructor(options: BrowserWindowConstructorOptions) {
            if (options?.webPreferences?.preload && options.title) {
                const original = options.webPreferences.preload;
                options.webPreferences.preload = join(__dirname, "preload.js");
                options.webPreferences.sandbox = false;
                if (settings.frameless) {
                    options.frame = false;
                }
                if (settings.transparent) {
                    options.transparent = true;
                    options.backgroundColor = "#00000000";
                }

                process.env.DISCORD_PRELOAD = original;

                super(options);
                initIpc(this);
            } else super(options);
        }
    }
    Object.assign(BrowserWindow, electron.BrowserWindow);
    Object.defineProperty(BrowserWindow, "name", { value: "BrowserWindow", configurable: true });

    const electronPath = require.resolve("electron");
    delete require.cache[electronPath]!.exports;
    require.cache[electronPath]!.exports = {
        ...electron,
        BrowserWindow
    };

    onceDefined(global, "appSettings", s => {
        s.set("MIN_WIDTH", 0);
        s.set("MIN_HEIGHT", 0);
        s.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
    });

    process.env.DATA_DIR = join(app.getPath("userData"), "..", "Voltage");

    electron.app.whenReady().then(() => {
        electron.protocol.registerFileProtocol("voltage", ({ url: unsafeUrl }, cb) => {
            let url = unsafeUrl.slice("voltage://".length);
            if (url.endsWith("/")) url = url.slice(0, -1);
            switch (url) {
                case "renderer.js.map":
                case "preload.js.map":
                case "patcher.js.map":
                    cb(join(__dirname, url));
                    break;
                default:
                    cb({ statusCode: 403 });
            }
        });

        try {
            if (settings?.ReactDevTools)
                installExt("fmkadmapgofadopljbjfkapdkoienihi")
                    .then(() => console.info("[Voltage] Installed React Developer Tools"))
                    .catch(err => console.error("[Voltage] Failed to install React Developer Tools", err));
        } catch { }

        type PolicyResult = Record<string, string[]>;

        const parsePolicy = (policy: string): PolicyResult => {
            const result: PolicyResult = {};
            policy.split(";").forEach(directive => {
                const [directiveKey, ...directiveValue] = directive.trim().split(/\s+/g);
                if (directiveKey && !Object.prototype.hasOwnProperty.call(result, directiveKey)) {
                    result[directiveKey] = directiveValue;
                }
            });
            return result;
        };
        const stringifyPolicy = (policy: PolicyResult): string =>
            Object.entries(policy)
                .filter(([, values]) => values?.length)
                .map(directive => directive.flat().join(" "))
                .join("; ");

        function patchCsp(headers: Record<string, string[]>, header: string) {
            if (header in headers) {
                const csp = parsePolicy(headers[header][0]);

                for (const directive of ["style-src", "connect-src", "img-src", "font-src", "media-src", "worker-src"]) {
                    csp[directive] = ["*", "blob:", "data:", "'unsafe-inline'"];
                }
                csp["script-src"] ??= [];
                csp["script-src"].push("'unsafe-eval'", "https://unpkg.com", "https://cdnjs.cloudflare.com");
                headers[header] = [stringifyPolicy(csp)];
            }
        }

        electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, resourceType }, cb) => {
            if (responseHeaders) {
                if (resourceType === "mainFrame")
                    patchCsp(responseHeaders, "content-security-policy");

                if (resourceType === "stylesheet")
                    responseHeaders["content-type"] = ["text/css"];
            }
            cb({ cancel: false, responseHeaders });
        });
    });
} else {
    console.log("[Voltage] Running in Vanilla Mode. Not Loading Voltage");
}

console.log("[Voltage] Loading Original Discord app.asar");

if (readFileSync(injectorPath, "utf-8").includes('require("../app.asar")')) {
    console.warn("[Voltage] [--> WARNING <--] You have a legacy Voltage install. Please reinject");
    const Module = require("module");
    const loadModule = Module._load;
    Module._load = function (path: string) {
        if (path === "../app.asar") {
            Module._load = loadModule;
            arguments[0] = require.main!.filename;
        }
        return loadModule.apply(this, arguments);
    };
} else {
    require(require.main!.filename);
}
