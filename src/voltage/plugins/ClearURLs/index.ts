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

import {
    addPreEditListener,
    addPreSendListener,
    MessageObject,
    removePreEditListener,
    removePreSendListener
} from "@api/MessageEvents";
import { Devs } from "@constants";
import definePlugin from "@types";

import { defaultRules } from "./rules";

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export default definePlugin({
    name: "Clear URLs",
    description: "Removes tracking attributes from URLs",
    authors: [Devs.Sappy],
    dependencies: ["Message Events API"],

    escapeRegExp(str: string) {
        return (str && reHasRegExpChar.test(str))
            ? str.replace(reRegExpChar, "\\$&")
            : (str || "");
    },

    createRules() {
        const rules = defaultRules;

        this.universalRules = new Set();
        this.rulesByHost = new Map();
        this.hostRules = new Map();

        for (const rule of rules) {
            const splitRule = rule.split("@");
            const paramRule = new RegExp(
                "^" +
                this.escapeRegExp(splitRule[0]).replace(/\\\*/, ".+?") +
                "$"
            );

            if (!splitRule[1]) {
                this.universalRules.add(paramRule);
                continue;
            }
            const hostRule = new RegExp(
                "^(www\\.)?" +
                this.escapeRegExp(splitRule[1])
                    .replace(/\\\./, "\\.")
                    .replace(/^\\\*\\\./, "(.+?\\.)?")
                    .replace(/\\\*/, ".+?") +
                "$"
            );
            const hostRuleIndex = hostRule.toString();

            this.hostRules.set(hostRuleIndex, hostRule);
            if (this.rulesByHost.get(hostRuleIndex) == null) {
                this.rulesByHost.set(hostRuleIndex, new Set());
            }
            this.rulesByHost.get(hostRuleIndex).add(paramRule);
        }
    },

    removeParam(rule: string | RegExp, param: string, parent: URLSearchParams) {
        if (param === rule || rule instanceof RegExp && rule.test(param)) {
            parent.delete(param);
        }
    },

    replacer(match: string) {
        try {
            var url = new URL(match);
        } catch (error) {
            return match;
        }

        if (url.searchParams.entries().next().done) {
            return match;
        }

        this.universalRules.forEach(rule => {
            url.searchParams.forEach((_value, param, parent) => {
                this.removeParam(rule, param, parent);
            });
        });

        this.hostRules.forEach((regex, hostRuleName) => {
            if (!regex.test(url.hostname)) return;
            this.rulesByHost.get(hostRuleName).forEach(rule => {
                url.searchParams.forEach((_value, param, parent) => {
                    this.removeParam(rule, param, parent);
                });
            });
        });

        return url.toString();
    },

    onSend(msg: MessageObject) {
        if (msg.content.match(/http(s)?:\/\//)) {
            msg.content = msg.content.replace(
                /(https?:\/\/[^\s<]+[^<.,:;"'>)|\]\s])/g,
                match => this.replacer(match)
            );
        }
    },

    start() {
        this.createRules();
        this.preSend = addPreSendListener((_, msg) => this.onSend(msg));
        this.preEdit = addPreEditListener((_cid, _mid, msg) =>
            this.onSend(msg)
        );
    },

    stop() {
        removePreSendListener(this.preSend);
        removePreEditListener(this.preEdit);
    },
});
