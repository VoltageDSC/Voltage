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

import { popNotice, showNotice } from "@api/Notices";
import { Link } from "@components/Link";
import { Devs } from "@constants";
import definePlugin from "@types";
import { filters, findByCodeLazy, mapMangledModuleLazy } from "@webpack";
import { FluxDispatcher, Forms, Toasts } from "@webpack/common";

const assetManager = mapMangledModuleLazy(
    "getAssetImage: size must === [number, number] for Twitch",
    {
        getAsset: filters.byCode("apply("),
    }
);

const lookupRpcApp = findByCodeLazy(".APPLICATION_RPC(");

async function lookupAsset(applicationId: string, key: string): Promise<string> {
    return (await assetManager.getAsset(applicationId, [key, undefined]))[0];
}

const apps: any = {};
async function lookupApp(applicationId: string): Promise<string> {
    const socket: any = {};
    await lookupRpcApp(socket, applicationId);
    return socket.application;
}

let ws: WebSocket;
export default definePlugin({
    name: "WebRPC",
    description: "Adds the ability to enable RPC on Discord Web (Experimental)",
    authors: [Devs.Sappy],
    target: "WEB",

    settingsAboutComponent: () => (
        <>
            <Forms.FormTitle tag="h3">How to use arRPC</Forms.FormTitle>
            <Forms.FormText>
                <Link href="https://github.com/OpenAsar/arrpc/tree/main#server">Follow the instructions in the GitHub repo</Link> to get the server running, and then enable the plugin.
            </Forms.FormText>
        </>
    ),

    async start() {
        if (ws) ws.close();
        ws = new WebSocket("ws://127.0.0.1:1337"); // try to open WebSocket

        ws.onmessage = async e => { // on message, set status to data
            const data = JSON.parse(e.data);

            if (data.activity?.assets?.large_image) data.activity.assets.large_image = await lookupAsset(data.activity.application_id, data.activity.assets.large_image);
            if (data.activity?.assets?.small_image) data.activity.assets.small_image = await lookupAsset(data.activity.application_id, data.activity.assets.small_image);

            if (data.activity) {
                const appId = data.activity.application_id;
                apps[appId] ||= await lookupApp(appId);

                const app = apps[appId];
                data.activity.name ||= app.name;
            }

            FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", ...data });
        };

        const connectionSuccessful = await new Promise(res => setTimeout(() => res(ws.readyState === WebSocket.OPEN), 1000)); // check if open after 1s
        if (!connectionSuccessful) {
            showNotice("Failed to connect to arRPC, is it running?", "Retry", () => { // show notice about failure to connect, with retry/ignore
                popNotice();
                this.start();
            });
            return;
        }

        Toasts.show({ // show toast on success
            message: "Connected to arRPC",
            type: Toasts.Type.SUCCESS,
            id: Toasts.genId(),
            options: {
                duration: 1000,
                position: Toasts.Position.BOTTOM
            }
        });
    },

    stop() {
        FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null }); // clear status
        ws.close(); // close WebSocket
    }
});
