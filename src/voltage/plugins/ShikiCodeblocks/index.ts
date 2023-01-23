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

import "./shiki.css";

import { enableStyle } from "@api/Styles";
import { Devs } from "@constants";
import definePlugin from "@types";

import previewExampleText from "~fileContent/previewExample.tsx";

import { shiki } from "./api/shiki";
import { createHighlighter } from "./components/Highlighter";
import deviconStyle from "./devicon.css?managed";
import { settings } from "./settings";
import { DeviconSetting } from "./types";
import { clearStyles } from "./utils/createStyle";

export default definePlugin({
    name: "ShikiCodeblocks",
    description: "Brings vscode-style codeblocks into Discord, powered by Shiki",
    authors: [Devs.Sappy],
    patches: [
        {
            find: "codeBlock:{react:function",
            replacement: {
                match: /codeBlock:\{react:function\((\i),(\i),(\i)\)\{/,
                replace: "$&return $self.renderHighlighter($1,$2,$3);",
            },
        },
    ],
    start: async () => {
        if (settings.store.useDevIcon !== DeviconSetting.Disabled)
            enableStyle(deviconStyle);

        await shiki.init(settings.store.customTheme || settings.store.theme);
    },
    stop: () => {
        shiki.destroy();
        clearStyles();
    },
    settingsAboutComponent: ({ tempSettings }) => createHighlighter({
        lang: "tsx",
        content: previewExampleText,
        isPreview: true,
        tempSettings,
    }),
    settings,

    // exports
    shiki,
    createHighlighter,
    renderHighlighter: ({ lang, content }: { lang: string; content: string; }) => {
        return createHighlighter({
            lang,
            content,
            isPreview: false,
        });
    },
});
