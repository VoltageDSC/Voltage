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

import { Devs } from "@constants";
import definePlugin from "@types";

const quotes = [
    "Preparing to Launch...",
    "Loading...",
    "Nobody likes to wait",
    "So let's make it better",
    "While you're waiting",
    "The true sign of intelligence is not knowledge but imagination.",
    "Biology gives you a brain. Life turns it into a mind.",
    "If you've nothing nice to say, say nothing.",
    "It's unlucky to be superstitious.",
    "Give up your seat for someone who needs it.",
    "Plant a tree.",
    "Touch some Grass.",
    "Value the people in your life.",
    "Don't take it personally.",
    "Accept advice.",
    "Enjoy a little nonsense now and then.",
    "Exercise in the rain can really make you feel alive.",
    "Don't waste food.",
    "Donate unused items.",
    "Eliminate the unnecessary.",
    "Build something out of LEGO.",
    "State the problem in words as clearly as possible.",
    "Don't always believe what you think.",
    "Your smile could make someone's day, don't forget to wear it.",
    "Life is short enough, don't race to the finish.",
    "What could you increase? What could you reduce?",
    "Try to pay at least one person a compliment every day.",
    "Giving someone a hug can be mutually rewarding.",
    "Gratitude is said to be the secret to happiness.",
    "Do something selfless.",
    "Donate to the homeless.",
    "You can have too much of a good thing.",
    "If you don't ask, you don't get.",
    "The hardest things to say are usually the most important."
];

export default definePlugin({
    name: "Loading Quotes",
    description: "Replace's Discords default loading quotes with custom ones.",
    authors: [Devs.Zach],
    patches: [
        {
            find: ".LOADING_DID_YOU_KNOW",
            replacement: {
                match: /\._loadingText=.+?random\(.+?;/s,
                replace: "._loadingText=Voltage.Plugins.plugins[\"Loading Quotes\"].quote;",
            },
        },
    ],

    get quote() {
        return (quotes[Math.floor(Math.random() * quotes.length)]);
    }
});
