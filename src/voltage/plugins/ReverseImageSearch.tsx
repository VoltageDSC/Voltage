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
import { Menu } from "@webpack/common";

const Engines = {
    Google: "https://lens.google.com/uploadbyurl?url=",
    Yandex: "https://yandex.com/images/search?rpt=imageview&url=",
    SauceNAO: "https://saucenao.com/search.php?url=",
    IQDB: "https://iqdb.org/?url=",
    TinEye: "https://www.tineye.com/search?url=",
    ImgOps: "https://imgops.com/start?url="
};

export default definePlugin({
    name: "Reverse Image Search",
    description: "Allows you to reverse lookup a image via the Image Context Menu",
    authors: [Devs.Sappy],
    dependencies: ["Context Menu API"],
    patches: [{
        find: "open-native-link",
        replacement: {
            match: /id:"open-native-link".{0,200}\(\{href:(.{0,3}),.{0,200}\},"open-native-link"\)/,
            replace: (m, src) =>
                `${m},Voltage.Plugins.plugins["Reverse Image Search"].makeMenu(${src}, arguments[2])`
        }
    }, {
        // pass the target to the open link menu so we can check if it's an image
        find: ".Messages.MESSAGE_ACTIONS_MENU_LABEL",
        replacement: [
            {
                match: /ariaLabel:\i\.Z\.Messages\.MESSAGE_ACTIONS_MENU_LABEL/,
                replace: "$&,_vencordTarget:arguments[0].target"
            },
            {
                // var f = props.itemHref, .... MakeNativeMenu(null != f ? f : blah)
                match: /(\i)=\i\.itemHref,.+?\(null!=\1\?\1:.{1,10}(?=\))/,
                replace: "$&,arguments[0]._vencordTarget"
            }
        ]
    }],

    makeMenu(src: string, target: HTMLElement) {
        if (target && !(target instanceof HTMLImageElement) && target.attributes["data-role"]?.value !== "img")
            return null;

        return (
            <Menu.MenuItem
                label="Search Image"
                key="search-image"
                id="search-image"
            >
                {Object.keys(Engines).map(engine => {
                    const key = "search-image-" + engine;
                    return (
                        <Menu.MenuItem
                            key={key}
                            id={key}
                            label={engine}
                            action={() => this.search(src, Engines[engine])}
                        />
                    );
                })}
                <Menu.MenuItem
                    key="search-image-all"
                    id="search-image-all"
                    label="All"
                    action={() => Object.values(Engines).forEach(e => this.search(src, e))}
                />
            </Menu.MenuItem>
        );
    },

    // openUrl is a mangled export, so just match it in the module and pass it
    search(src: string, engine: string) {
        open(engine + encodeURIComponent(src), "_blank");
    }
});
