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

function fetchOptions(url) {
    return new Promise((resolve, reject) => {
        const opt = {
            method: "OPTIONS",
            url: url,
        };
        opt.onload = resp => resolve(resp.responseHeaders);
        opt.ontimeout = () => reject("fetch timeout");
        opt.onerror = () => reject("fetch error");
        opt.onabort = () => reject("fetch abort");
        GM_xmlhttpRequest(opt);
    });
}

function parseHeaders(headers) {
    if (!headers)
        return {};
    const result = {};
    const headersArr = headers.trim().split("\n");
    for (var i = 0; i < headersArr.length; i++) {
        var row = headersArr[i];
        var index = row.indexOf(":")
            , key = row.slice(0, index).trim().toLowerCase()
            , value = row.slice(index + 1).trim();

        if (result[key] === undefined) {
            result[key] = value;
        } else if (Array.isArray(result[key])) {
            result[key].push(value);
        } else {
            result[key] = [result[key], value];
        }
    }
    return result;
}

// returns true if CORS permits request
async function checkCors(url, method) {
    const headers = parseHeaders(await fetchOptions(url));

    const origin = headers["access-control-allow-origin"];
    if (origin !== "*" && origin !== window.location.origin) return false;

    const methods = headers["access-control-allow-methods"]?.split(/,\s/g);
    if (methods && !methods.includes(method)) return false;

    return true;
}

function blobTo(to, blob) {
    if (to === "arrayBuffer" && blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise((resolve, reject) => {
        var fileReader = new FileReader();
        fileReader.onload = event => resolve(event.target.result);
        if (to === "arrayBuffer") fileReader.readAsArrayBuffer(blob);
        else if (to === "text") fileReader.readAsText(blob, "utf-8");
        else reject("unknown to");
    });
}

function GM_fetch(url, opt) {
    return new Promise((resolve, reject) => {
        checkCors(url, opt?.method || "GET")
            .then(can => {
                if (can) {
                    // https://www.tampermonkey.net/documentation.php?ext=dhdg#GM_xmlhttpRequest
                    const options = opt || {};
                    options.url = url;
                    options.data = options.body;
                    options.responseType = "blob";
                    options.onload = resp => {
                        var blob = resp.response;
                        resp.blob = () => Promise.resolve(blob);
                        resp.arrayBuffer = () => blobTo("arrayBuffer", blob);
                        resp.text = () => blobTo("text", blob);
                        resp.json = async () => JSON.parse(await blobTo("text", blob));
                        resolve(resp);
                    };
                    options.ontimeout = () => reject("fetch timeout");
                    options.onerror = () => reject("fetch error");
                    options.onabort = () => reject("fetch abort");
                    GM_xmlhttpRequest(options);
                } else {
                    reject("CORS issue");
                }
            });
    });
}
export const fetch = GM_fetch;
