/* eslint-disable header/header */

/*!
 * crxToZip
 * Copyright (c) 2013 Rob Wu <rob@robwu.nl>
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function crxToZip(buf: Buffer) {
    function calcLength(a: number, b: number, c: number, d: number) {
        let length = 0;

        length += a << 0;
        length += b << 8;
        length += c << 16;
        length += d << 24 >>> 0;
        return length;
    }

    if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4) {
        return buf;
    }

    if (buf[0] !== 67 || buf[1] !== 114 || buf[2] !== 50 || buf[3] !== 52) {
        throw new Error("Invalid header: Does not start with Cr24");
    }

    const isV3 = buf[4] === 3;
    const isV2 = buf[4] === 2;

    if ((!isV2 && !isV3) || buf[5] || buf[6] || buf[7]) {
        throw new Error("Unexpected crx format version number.");
    }

    if (isV2) {
        const publicKeyLength = calcLength(buf[8], buf[9], buf[10], buf[11]);
        const signatureLength = calcLength(buf[12], buf[13], buf[14], buf[15]);

        const zipStartOffset = 16 + publicKeyLength + signatureLength;

        return buf.subarray(zipStartOffset, buf.length);
    }

    const headerSize = calcLength(buf[8], buf[9], buf[10], buf[11]);
    const zipStartOffset = 12 + headerSize;

    return buf.subarray(zipStartOffset, buf.length);
}
