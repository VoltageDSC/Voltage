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

import "./updater";

import { debounce } from "@utils/Debounce";
import IpcEvents from "@utils/IPC";
import { Queue } from "@utils/Queue";
import { BrowserWindow, ipcMain, shell } from "electron";
import { mkdirSync, readFileSync, watch } from "fs";
import { open, readFile, writeFile } from "fs/promises";
import { join } from "path";

import monacoHtml from "~fileContent/../../voltage/components/customcss/monacoWin.html;base64";

import { ALLOWED_PROTOCOLS, CUSTOMCSS_PATH, SETTINGS_DIR, SETTINGS_FILE } from "./constants";

mkdirSync(SETTINGS_DIR, { recursive: true });

function readCss() {
    return readFile(CUSTOMCSS_PATH, "utf-8").catch(() => "");
}

export function readSettings() {
    try {
        return readFileSync(SETTINGS_FILE, "utf-8");
    } catch {
        return "{}";
    }
}

ipcMain.handle(IpcEvents.OPEN_CUSTOMCSS, () => shell.openPath(CUSTOMCSS_PATH));
ipcMain.handle(IpcEvents.OPEN_EXTERNAL, (_, url) => {
    try {
        var { protocol } = new URL(url);
    } catch {
        throw "Malformed URL";
    }
    if (!ALLOWED_PROTOCOLS.includes(protocol))
        throw "Disallowed Protocol.";

    shell.openExternal(url);
});

const cssWriteQueue = new Queue();
const settingsWriteQueue = new Queue();

ipcMain.handle(IpcEvents.GET_CUSTOM_CSS, () => readCss());
ipcMain.handle(IpcEvents.SET_CUSTOM_CSS, (_, css) =>
    cssWriteQueue.push(() => writeFile(CUSTOMCSS_PATH, css))
);

ipcMain.handle(IpcEvents.GET_SETTINGS_DIR, () => SETTINGS_DIR);
ipcMain.on(IpcEvents.GET_SETTINGS, e => e.returnValue = readSettings());

ipcMain.handle(IpcEvents.SET_SETTINGS, (_, s) => {
    settingsWriteQueue.push(() => writeFile(SETTINGS_FILE, s));
});

export function initIpc(mainWindow: BrowserWindow) {
    open(CUSTOMCSS_PATH, "a+").then(fd => {
        fd.close();
        watch(CUSTOMCSS_PATH, { persistent: false }, debounce(async () => {
            mainWindow.webContents.postMessage(IpcEvents.CUSTOM_CSS_UPDATE, await readCss());
        }, 50));
    });
}

ipcMain.handle(IpcEvents.OPEN_MONACO_EDITOR, async () => {
    const win = new BrowserWindow({
        title: "Custom CSS Editor",
        autoHideMenuBar: true,
        darkTheme: true,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });
    await win.loadURL(`data:text/html;base64,${monacoHtml}`);
});
