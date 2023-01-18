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

import * as DataStore from "../src/core/api/Data";
import IpcEvents from "../src/voltage/utils/IPC";

const { localStorage } = window;

const listeners = {} as Record<string, Set<Function>>;

const handlers = {
    [IpcEvents.GET_REPO]: () => "https://codeberg.org/Voltage/Voltage",
    [IpcEvents.GET_SETTINGS_DIR]: () => "LocalStorage",

    [IpcEvents.GET_CUSTOM_CSS]: () => DataStore.get("VoltageCustomCSS").then(s => s ?? ""),
    [IpcEvents.SET_CUSTOM_CSS]: (css: string) => {
        DataStore.set("VoltageCustomCSS", css);
        listeners[IpcEvents.CUSTOM_CSS_UPDATE]?.forEach(l => l(null, css));
    },

    [IpcEvents.GET_SETTINGS]: () => localStorage.getItem("Settings") || "{}",
    [IpcEvents.SET_SETTINGS]: (s: string) => localStorage.setItem("Settings", s),

    [IpcEvents.GET_UPDATES]: () => ({ ok: true, value: [] }),

    [IpcEvents.OPEN_EXTERNAL]: (url: string) => open(url, "_blank"),
};

function onEvent(event: string, ...args: any[]) {
    const handler = handlers[event];
    if (!handler) throw new Error(`Event ${event} Not Implemented.`);
    return handler(...args);
}

window.VoltageNative = {
    getVersions: () => ({}),
    ipc: {
        send: (event: string, ...args: any[]) => void onEvent(event, ...args),
        sendSync: onEvent,
        on(event: string, listener: () => {}) {
            (listeners[event] ??= new Set()).add(listener);
        },
        off(event: string, listener: () => {}) {
            return listeners[event]?.delete(listener);
        },
        invoke: (event: string, ...args: any[]) => Promise.resolve(onEvent(event, ...args))
    },
};
