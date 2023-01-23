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

export const wordsFromCamel = (text: string) => text.split(/(?=[A-Z])/).map(w => w.toLowerCase());
export const wordsFromSnake = (text: string) => text.toLowerCase().split("_");
export const wordsFromKebab = (text: string) => text.toLowerCase().split("-");
export const wordsFromPascal = (text: string) => text.split(/(?=[A-Z])/).map(w => w.toLowerCase());
export const wordsFromTitle = (text: string) => text.toLowerCase().split(" ");

export const wordsToCamel = (words: string[]) =>
    words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join("");
export const wordsToSnake = (words: string[]) => words.join("_").toUpperCase();
export const wordsToKebab = (words: string[]) => words.join("-").toLowerCase();
export const wordsToPascal = (words: string[]) =>
    words.map(w => w[0].toUpperCase() + w.slice(1)).join("");
export const wordsToTitle = (words: string[]) =>
    words.map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
