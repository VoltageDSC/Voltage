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

import { ApplicationCommandInputType, findOption, OptionalMessageOption, RequiredMessageOption, sendBotMessage } from "@api/Commands";
import { Devs } from "@constants";
import definePlugin from "@types";

function mock(input: string): string {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        output += i % 2 ? input[i].toUpperCase() : input[i].toLowerCase();
    }
    return output;
}

export default definePlugin({
    name: "Slash Commands",
    description: "echo, lenny, mock",
    authors: [Devs.Sappy],
    dependencies: ["Commands API"],
    commands: [
        {
            name: "echo",
            description: "Sends a message as Clyde (locally)",
            options: [OptionalMessageOption],
            inputType: ApplicationCommandInputType.BOT,
            execute: (opts, ctx) => {
                const content = findOption(opts, "message", "");

                sendBotMessage(ctx.channel.id, { content });
            },
        },
        {
            name: "lenny",
            description: "Sends a lenny face",
            options: [OptionalMessageOption],
            execute: opts => ({
                content: findOption(opts, "message", "") + " ( ͡° ͜ʖ ͡°)"
            }),
        },
        {
            name: "mock",
            description: "mOcK PeOpLe",
            options: [RequiredMessageOption],
            execute: opts => ({
                content: mock(findOption(opts, "message", ""))
            }),
        },
    ]
});
