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
import { Queue } from "@utils/Queue";
import { find } from "@webpack";

import monacoHtml from "~fileContent/monacoWin.html";

const queue = new Queue();
const setCss = debounce((css: string) => {
    queue.push(() => VoltageNative.ipc.invoke(IpcEvents.SET_CUSTOM_CSS, css));
});

export async function launchMonacoEditor() {
    const features = `popup,width=${Math.min(window.innerWidth, 1000)},height=${Math.min(window.innerHeight, 1000)}`;
    const win = open("about:blank", "VoltageCustomCSS", features);
    if (!win) {
        alert("Failed to Open Custom CSS Popup. Make Sure to Allow Popups!");
        return;
    }

    win.setCss = setCss;
    win.getCurrentCss = () => VoltageNative.ipc.invoke(IpcEvents.GET_CUSTOM_CSS);
    win.getTheme = () =>
        find(m =>
            m.ProtoClass?.typeName.endsWith("PreloadedUserSettings")
        )?.getCurrentValue()?.appearance?.theme === 2
            ? "vs-light"
            : "vs-dark";

    win.document.write(monacoHtml);

    window.__VOLTAGE_MONACO_WIN__ = new WeakRef(win);
}
