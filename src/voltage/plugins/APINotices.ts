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

export default definePlugin({
    name: "Notices API",
    description: "API that fixes notices being automatically dismissed.",
    authors: [Devs.Zach],
    required: true,
    patches: [
        {
            find: 'displayName="NoticeStore"',
            replacement: [
                {
                    match: /;.{1,2}=null;.{0,70}getPremiumSubscription/g,
                    replace:
                        ";if(Voltage.Api.Notices.currentNotice)return false$&"
                },
                {
                    match: /(?<=NOTICE_DISMISS:function.+?){(?=if\(null==(.+?)\))/,
                    replace: '{if($1?.id=="VoltageNotice")return ($1=null,Voltage.Api.Notices.nextNotice(),true);'
                }
            ]
        }
    ],
});
