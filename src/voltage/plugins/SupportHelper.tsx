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

import { DataStore } from "@api/index";
import { Devs, SUPPORT_CHANNEL_ID } from "@constants";
import definePlugin from "@types";
import { makeCodeblock } from "@utils/Misc";
import { isOutdated } from "@utils/Updater";
import { Alerts, FluxDispatcher, Forms, UserStore } from "@webpack/common";

import gitHash from "~git-hash";
import plugins from "~plugins";

import settings from "./Settings";

const REMEMBER_DISMISS_KEY = "Voltage-SupportHelper-Dismiss";

export default definePlugin({
    name: "Support Helper",
    required: true,
    description: "Helps me provide support to you",
    authors: [Devs.Sappy],
    dependencies: ["Commands API"],

    commands: [{
        name: "voltage-debug",
        description: "Send Voltage Debug info",
        execute() {
            const { RELEASE_CHANNEL } = window.GLOBAL_ENV;

            const debugInfo = `
**Voltage Debug Info**
> Discord Branch: ${RELEASE_CHANNEL}
> Client: ${typeof DiscordNative === "undefined" ? window.armcord ? "Armcord" : `Web (${navigator.userAgent})` : `Desktop (Electron v${settings.electronVersion})`}
> Platform: ${window.navigator.platform}
> Voltage Version: ${gitHash}${settings.additionalInfo}
> Outdated: ${isOutdated}
> Enabled Plugins:
${makeCodeblock(Object.keys(plugins).filter(Voltage.Plugins.isPluginEnabled).join(", "))}
`;

            return {
                content: debugInfo.trim()
            };
        }
    }],

    rememberDismiss() {
        DataStore.set(REMEMBER_DISMISS_KEY, gitHash);
    },

    start() {
        FluxDispatcher.subscribe("CHANNEL_SELECT", async ({ channelId }) => {
            if (channelId !== SUPPORT_CHANNEL_ID) return;

            const myId = BigInt(UserStore.getCurrentUser().id);
            if (Object.values(Devs).some(d => d.id === myId)) return;

            if (isOutdated && gitHash !== await DataStore.get(REMEMBER_DISMISS_KEY)) {
                Alerts.show({
                    title: "Hold on!",
                    body: <div>
                        <Forms.FormText>You are using an outdated version of Voltage! Chances are, your issue is already fixed.</Forms.FormText>
                        <Forms.FormText>
                            Please first update using the Updater Page in Settings.
                        </Forms.FormText>
                    </div>,
                    onCancel: this.rememberDismiss,
                    onConfirm: this.rememberDismiss
                });
            }
        });
    }
});
