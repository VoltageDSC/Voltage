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

let style: HTMLStyleElement;

function setCss() {
    style.textContent = `
        .voiltage-nsfw-img [class^=imageWrapper] img,
        .voiltage-nsfw-img [class^=wrapperPaused] video {
            filter: blur(${Settings.plugins.BlurNSFW.blurAmount}px);
            transition: filter 0.2s;
        }
        .voiltage-nsfw-img [class^=imageWrapper]:hover img,
        .voiltage-nsfw-img [class^=wrapperPaused]:hover video {
            filter: unset;
        }
        `;
}

export default definePlugin({
    name: "BlurNSFW",
    description: "Blurs attachments in NSFW channels until Hovered",
    authors: [Devs.Sappy],

    patches: [
        {
            find: ".embedWrapper,embed",
            replacement: [{
                match: /(\.renderEmbed=.+?(.)=.\.props)(.+?\.embedWrapper)/g,
                replace: "$1,vcProps=$2$3+(vcProps.channel.nsfw?' voiltage-nsfw-img':'')"
            }, {
                match: /(\.renderAttachments=.+?(.)=this\.props)(.+?\.embedWrapper)/g,
                replace: "$1,vcProps=$2$3+(vcProps.channel.nsfw?' voiltage-nsfw-img':'')"
            }]
        }
    ],

    options: {
        blurAmount: {
            type: OptionType.NUMBER,
            description: "Blur Amount",
            default: 10,
            onChange: setCss
        }
    },

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        setCss();
    },

    stop() {
        style?.remove();
    }
});
