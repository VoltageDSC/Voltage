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

import gitHash from "~git-hash";
import gitRemote from "~git-remote";

export const WEBPACK_CHUNK = "webpackChunkdiscord_app";
export const REACT_GLOBAL = "Voltage.Webpack.Common.React";
export const VOLTAGE_USER_AGENT = `Voltage/${gitHash}${gitRemote ? ` (https://codeberg.org/${gitRemote})` : ""}`;

export const Devs = /* #__PURE__*/ Object.freeze({
    Zach: {
        name: "Zach",
        id: 419788419095330826n
    },
    Sappy: {
        name: "Sappy",
        id: 741262207391629343n
    }
});
