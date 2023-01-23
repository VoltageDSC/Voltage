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

type Enum<T extends Record<string, string>> = {
    [k in keyof T]: T[k];
} & { [v in keyof T as T[v]]: v; };

function strEnum<T extends Record<string, string>>(obj: T): T {
    const o = {} as T;
    for (const key in obj) {
        o[key] = obj[key] as any;
        o[obj[key]] = key as any;
    }
    return Object.freeze(o);
}

export default strEnum({
    CUSTOM_CSS_UPDATE: "VoltageCustomCSSUpdate",
    GET_CUSTOM_CSS: "VoltageGetCustomCSS",
    SET_CUSTOM_CSS: "VoltageSetCustomCSS",
    GET_SETTINGS_DIR: "VoltageGetSettingsDir",
    GET_SETTINGS: "VoltageGetSettings",
    SET_SETTINGS: "VoltageSetSettings",
    OPEN_EXTERNAL: "VoltageOpenExternal",
    OPEN_CUSTOMCSS: "VoltageOpenCustomCSS",
    GET_UPDATES: "VoltageGetUpdates",
    GET_REPO: "VoltageGetRepo",
    GET_HASHES: "VoltageGetHashes",
    UPDATE: "VoltageUpdate",
    BUILD: "VoltageBuild",
    OPEN_MONACO_EDITOR: "VoltageOpenMonacoEditor",
    DOWNLOAD_VOLTAGE_CSS: "VoltageDownloadVoltageCss"
} as const);
