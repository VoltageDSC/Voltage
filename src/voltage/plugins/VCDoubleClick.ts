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
import { SelectedChannelStore } from "@webpack/common";

const timers = {} as Record<string, {
    timeout?: NodeJS.Timeout;
    i: number;
}>;

export default definePlugin({
    name: "VC Double Click",
    description: "Requires you to double click voice channels to join them.",
    authors: [Devs.Sappy],
    patches: [
        {
            find: "VoiceChannel.renderPopout",
            // hack: these are not React onClick, it is a custom prop handled by Discord
            // thus, replacing this with onDoubleClick won't work, and you also cannot check
            // e.detail since instead of the event they pass the channel.
            // do this timer workaround instead
            replacement: [
                // voice/stage channels
                {
                    match: /onClick:function\(\)\{(e\.handleClick.+?)}/g,
                    replace: "onClick:function(){Voltage.Plugins.plugins[\"VC Double Click\"].schedule(()=>{$1},e)}",
                },
            ],
        },
        {
            // channel mentions
            find: ".shouldCloseDefaultModals",
            replacement: {
                match: /onClick:(\i)(?=,.{0,30}className:"channelMention")/,
                replace: "onClick:(_vcEv)=>(_vcEv.detail>=2||_vcEv.target.className.includes('MentionText'))&&($1)()",
            }
        }
    ],

    schedule(cb: () => void, e: any) {
        const id = e.props.channel.id as string;
        if (SelectedChannelStore.getVoiceChannelId() === id) {
            cb();
            return;
        }
        // use a different counter for each channel
        const data = (timers[id] ??= { timeout: void 0, i: 0 });
        // clear any existing timer
        clearTimeout(data.timeout);

        // if we already have 2 or more clicks, run the callback immediately
        if (++data.i >= 2) {
            cb();
            delete timers[id];
        } else {
            // else reset the counter in 500ms
            data.timeout = setTimeout(() => {
                delete timers[id];
            }, 500);
        }
    }
});
