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

import IpcEvents from "@utils/IPC";
import { ipcMain } from "electron";
import { writeFile } from "fs/promises";
import { join } from "path";

import gitHash from "~git-hash";
import gitRemote from "~git-remote";

import { get } from "../simpleGet";
import { calculateHashes, serializeErrors } from "./common";

const API_BASE = `https://codeberg.org/api/v1/repos/${gitRemote}`;
let PendingUpdates = [] as [string, string][];

async function githubGet(endpoint: string) {
    return get(API_BASE + endpoint, {
        headers: {
            Accept: "application/json"
        }
    });
}

async function calculateGitChanges() {
    const isOutdated = await fetchUpdates();
    if (!isOutdated) return [];

    const res = await githubGet(`/compare/${gitHash}...HEAD`);

    const data = JSON.parse(res.toString("utf-8"));
    return data.commits.map(c => ({
        hash: c.sha.slice(0, 7),
        author: c.author.login,
        message: c.commit.message
    }));
}

async function fetchUpdates() {
    const release = await githubGet("/releases/latest");

    const data = JSON.parse(release.toString());
    const hash = data.name.slice(data.name.lastIndexOf(" ") + 1);
    if (hash === gitHash)
        return false;

    data.assets.forEach(({ name, browser_download_url }) => {
        if (["patcher.js", "preload.js", "renderer.js", "renderer.css"].some(s => name.startsWith(s))) {
            PendingUpdates.push([name, browser_download_url]);
        }
    });
    return true;
}

async function applyUpdates() {
    await Promise.all(PendingUpdates.map(
        async ([name, data]) => writeFile(join(__dirname, name), await get(data)))
    );
    PendingUpdates = [];
    return true;
}

ipcMain.handle(IpcEvents.GET_HASHES, serializeErrors(calculateHashes));
ipcMain.handle(IpcEvents.GET_REPO, serializeErrors(() => `https://codeberg.org/${gitRemote}`));
ipcMain.handle(IpcEvents.GET_UPDATES, serializeErrors(calculateGitChanges));
ipcMain.handle(IpcEvents.UPDATE, serializeErrors(fetchUpdates));
ipcMain.handle(IpcEvents.BUILD, serializeErrors(applyUpdates));
