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

import { Settings } from "@api/Settings";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { findByPropsLazy } from "@webpack";
import { Forms, React } from "@webpack/common";

const KbdStyles = findByPropsLazy("key", "removeBuildOverride");

export default definePlugin({
    name: "Experiments",
    authors: [Devs.Sappy],
    description: "Enables Access to the Experiments Tab in Discord.",
    patches: [{
        find: "Object.defineProperties(this,{isDeveloper",
        replacement: {
            match: /(?<={isDeveloper:\{[^}]+,get:function\(\)\{return )\w/,
            replace: "true"
        },
    }, {
        find: 'type:"user",revision',
        replacement: {
            match: /!(\w{1,3})&&"CONNECTION_OPEN".+?;/g,
            replace: "$1=!0;"
        },
    }, {
        find: ".isStaff=function(){",
        predicate: () => Settings.plugins.Experiments.enableIsStaff === true,
        replacement: [
            {
                match: /return\s*(\w+)\.hasFlag\((.+?)\.STAFF\)}/,
                replace: "return Voltage.Webpack.Common.UserStore.getCurrentUser().id===$1.id||$1.hasFlag($2.STAFF)}"
            },
            {
                match: /hasFreePremium=function\(\){return this.isStaff\(\)\s*\|\|/,
                replace: "hasFreePremium=function(){return ",
            },
        ],
    }],
    options: {
        enableIsStaff: {
            description: "Enable isStaff (requires restart)",
            type: OptionType.BOOLEAN,
            default: false,
            restartNeeded: true,
        }
    },

    settingsAboutComponent: () => {
        const isMacOS = navigator.platform.includes("Mac");
        const modKey = isMacOS ? "cmd" : "ctrl";
        const altKey = isMacOS ? "opt" : "alt";
        return (
            <React.Fragment>
                <Forms.FormTitle tag="h3">More Information</Forms.FormTitle>
                <Forms.FormText variant="text-md/normal">
                    You can enable client DevTools{" "}
                    <kbd className={KbdStyles.key}>{modKey}</kbd> +{" "}
                    <kbd className={KbdStyles.key}>{altKey}</kbd> +{" "}
                    <kbd className={KbdStyles.key}>O</kbd>{" "}
                    after enabling <code>isStaff</code> below
                </Forms.FormText>
                <Forms.FormText>
                    and then toggling <code>Enable DevTools</code> in the <code>Developer Options</code> tab in settings.
                </Forms.FormText>
            </React.Fragment>
        );
    }
});
