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

export * as Plugins from "../voltage/plugins";
export * as Util from "../voltage/utils";
export * as CustomCSS from "../voltage/utils/CustomCSS";
export * as Updater from "../voltage/utils/Updater";
export * as Webpack from "../voltage/webpack";
export * as Api from "./api";
export { PlainSettings, Settings };

// eslint-disable-next-line path-alias/no-relative
import "../voltage/utils/CustomCSS";
// eslint-disable-next-line path-alias/no-relative
import "../voltage/webpack/patchWebpack";

import { popNotice, showNotice } from "@api/Notices";
import { PlainSettings, Settings } from "@api/Settings";
import { checkForUpdates, UpdateLogger } from "@utils/Updater";
import { onceReady } from "@webpack";
import { Router } from "@webpack/common";

import { patches, PMLogger, startAllPlugins } from "../voltage/plugins";

export let Components: any;

async function init() {
    await onceReady;
    startAllPlugins();
    Components = await import("../voltage/components");

    if (!IS_WEB) {
        try {
            const isOutdated = await checkForUpdates();
            if (isOutdated && Settings.ShowToasts)
                setTimeout(() => {
                    showNotice(
                        "A new update is available for Voltage. Would you like to view the update?",
                        "View Update",
                        () => {
                            popNotice();
                            Router.open("Updater");
                        }
                    );
                }, 10000);
        } catch (err) {
            UpdateLogger.error("Failed to check for updates", err);
        }
    }

    if (IS_DEV) {
        const pendingPatches = patches.filter(p => !p.all && p.predicate?.() !== false);
        if (pendingPatches.length)
            PMLogger.warn(
                "Webpack has finished initialising, but some patches haven't been applied yet.",
                "This might be expected since some Modules are lazy loaded, but please verify",
                "that all plugins are working as intended.",
                "You are seeing this warning because this is a Development build of Voltage.",
                "\nThe following patches have not been applied:",
                "\n\n" + pendingPatches.map(p => `${p.plugin}: ${p.find}`).join("\n")
            );
    }
}

init();
