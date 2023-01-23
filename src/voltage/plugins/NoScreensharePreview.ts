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

import { Devs } from "@constants";
import definePlugin from "@types";

export default definePlugin({
    name: "No Screenshare Preview",
    description: "Disables screenshare previews from being sent.",
    authors: [Devs.Sappy],
    patches: [
        {
            find: '("ApplicationStreamPreviewUploadManager")',
            replacement: [
                ".\\.default\\.makeChunkedRequest\\(",
                ".{1,2}\\..\\.post\\({url:"
            ].map(match => ({
                match: new RegExp(`return\\[(?<code>\\d),${match}.\\..{1,3}\\.STREAM_PREVIEW.+?}\\)\\];`),
                replace: 'return[$<code>,Promise.resolve({body:"",status:204})];'
            }))
        },
    ],
});
