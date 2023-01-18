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

export class ChangeList<T>{
    private set = new Set<T>();

    public get changeCount() {
        return this.set.size;
    }

    public get hasChanges() {
        return this.changeCount > 0;
    }

    public handleChange(item: T) {
        if (!this.set.delete(item))
            this.set.add(item);
    }

    public add(item: T) {
        return this.set.add(item);
    }

    public remove(item: T) {
        return this.set.delete(item);
    }

    public getChanges() {
        return this.set.values();
    }

    public map<R>(mapper: (v: T, idx: number, arr: T[]) => R): R[] {
        return [...this.getChanges()].map(mapper);
    }
}
