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

import IpcEvents from "@utils/IPC";
import { Button } from "@webpack/common";

import { Heart } from "./Heart";

export default function DonateButton(props: any) {
    return (
        <Button
            {...props}
            look={Button.Looks.LINK}
            color={Button.Colors.TRANSPARENT}
            onClick={() =>
                VoltageNative.ipc.invoke(IpcEvents.OPEN_EXTERNAL, "https://codeberg.org/ZachJMurphy")
            }
        >
            <Heart />
            Donate
        </Button>
    );
}
