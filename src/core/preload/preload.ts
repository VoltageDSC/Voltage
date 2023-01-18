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

import { debounce } from "@utils/Debounce";
import IpcEvents from "@utils/IPC";
import { contextBridge, ipcRenderer, webFrame } from "electron";
import { readFileSync, watch } from "fs";
import { join } from "path";

import VoltageNative from "../VoltageNative";

contextBridge.exposeInMainWorld("VoltageNative", VoltageNative);

if (location.protocol !== "data:") {
    // Discord
    webFrame.executeJavaScript(readFileSync(join(__dirname, "renderer.js"), "utf-8"));
    const rendererCss = join(__dirname, "renderer.css");

    function insertCss(css: string) {
        const style = document.createElement("style");
        style.id = "voltage-css-core";
        style.textContent = css;

        if (document.readyState === "complete") {
            document.documentElement.appendChild(style);
        } else {
            document.addEventListener("DOMContentLoaded", () => document.documentElement.appendChild(style), {
                once: true
            });
        }
    }

    try {
        const css = readFileSync(rendererCss, "utf-8");
        insertCss(css);
        if (IS_DEV) {
            // persistent means keep process running if watcher is the only thing still running
            // which we obviously don't want
            watch(rendererCss, { persistent: false }, () => {
                document.getElementById("voltage-css-core")!.textContent = readFileSync(rendererCss, "utf-8");
            });
        }
    } catch (err) {
        if ((err as NodeJS.ErrnoException)?.code !== "ENOENT")
            throw err;

        // hack: the pre update updater does not download this file, so manually download it
        // TODO: remove this in a future version
        ipcRenderer.invoke(IpcEvents.DOWNLOAD_VOLTAGE_CSS)
            .then(insertCss);
    }
    require(process.env.DISCORD_PRELOAD!);
} else {
    // Monaco Popout
    contextBridge.exposeInMainWorld("setCss", debounce(s => VoltageNative.ipc.invoke(IpcEvents.SET_CUSTOM_CSS, s)));
    contextBridge.exposeInMainWorld("getCurrentCss", () => VoltageNative.ipc.invoke(IpcEvents.GET_CUSTOM_CSS));
    // shrug
    contextBridge.exposeInMainWorld("getTheme", () => "vs-dark");
}
