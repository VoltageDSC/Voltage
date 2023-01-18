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

import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/errors/ErrorBoundary";
import { Link } from "@components/Link";
import { useAwaiter } from "@utils/Misc";
import { findLazy } from "@webpack";
import { Card, Forms, Margins, React, TextArea } from "@webpack/common";

const TextAreaProps = findLazy(m => typeof m.textarea === "string");

function Validator({ link }: { link: string; }) {
    const [res, err, pending] = useAwaiter(() => fetch(link).then(res => {
        if (res.status > 300) throw `${res.status} ${res.statusText}`;
        const contentType = res.headers.get("Content-Type");
        if (!contentType?.startsWith("text/css") && !contentType?.startsWith("text/plain"))
            throw "Invalid CSS File. Remember to use the raw link!";

        return "Okay!";
    }));

    const text = pending
        ? "Checking..."
        : err
            ? `Error: ${err instanceof Error ? err.message : String(err)}`
            : "Valid";

    return <Forms.FormText style={{
        color: pending ? "var(--text-muted)" : err ? "var(--text-danger)" : "var(--text-positive)"
    }}>{text}</Forms.FormText>;
}

function Validators({ themeLinks }: { themeLinks: string[]; }) {
    if (!themeLinks.length) return null;

    return (
        <>
            <Forms.FormTitle className={Margins.marginTop20} tag="h5">Validator</Forms.FormTitle>
            <Forms.FormText>This section will tell you whether your themes can successfully be loaded</Forms.FormText>
            <div>
                {themeLinks.map(link => (
                    <Card style={{
                        padding: ".5em",
                        marginBottom: ".5em",
                        marginTop: ".5em"
                    }} key={link}>
                        <Forms.FormTitle tag="h5" style={{
                            overflowWrap: "break-word"
                        }}>
                            {link}
                        </Forms.FormTitle>
                        <Validator link={link} />
                    </Card>
                ))}
            </div>
        </>
    );
}

export default ErrorBoundary.wrap(function () {
    const settings = useSettings();
    const ref = React.useRef<HTMLTextAreaElement>();

    function onBlur() {
        settings.themeLinks = [...new Set(
            ref.current!.value
                .trim()
                .split(/\n+/)
                .map(s => s.trim())
                .filter(Boolean)
        )];
    }

    return (
        <>
            <Card className="voltage-settings-card">
                <Forms.FormTitle tag="h5">Instructions:</Forms.FormTitle>
                <Forms.FormText>One link per line</Forms.FormText>
                <Forms.FormText>Make sure to use the raw links or github.io links!</Forms.FormText>
                <Forms.FormDivider />
                <Forms.FormTitle tag="h5">Find Themes:</Forms.FormTitle>
                <div style={{ marginBottom: ".5em" }}>
                    <ul>
                        <li>• <Link style={{ marginRight: ".5em" }} href="https://betterdiscord.app/themes">BetterDiscord</Link></li>
                        <li>• <Link href="https://github.com/search?q=discord+theme">GitHub</Link></li>
                    </ul>
                </div>
                <Forms.FormDivider />
                <Forms.FormTitle tag="h5">Configuration:</Forms.FormTitle>
                <Forms.FormText>If using the BetterDiscord site, click on "Source" below the Download Button</Forms.FormText>
                <Forms.FormText>In the GitHub Repository of your theme, find X.theme.css / X.css, click on it, then click the "Raw" button</Forms.FormText>
                <Forms.FormText>
                    <Forms.FormDivider />
                    If the theme has configuration that requires you to edit the file:
                    <ul>
                        <Forms.FormDivider />
                        <li>• Make a <Link href="https://github.com/signup">GitHub</Link> Account</li>
                        <li>• Click the Fork Button on the Top Right</li>
                        <li>• Edit the File</li>
                        <li>• Use the Link to your own Repository Instead</li>
                    </ul>
                </Forms.FormText>
            </Card>
            <Forms.FormTitle tag="h5">Themes</Forms.FormTitle>
            <TextArea
                style={{
                    padding: ".5em",
                    border: "1px solid var(--background-modifier-accent)"
                }}
                ref={ref}
                defaultValue={settings.themeLinks.join("\n")}
                className={TextAreaProps.textarea}
                placeholder="Paste links to .css"
                spellCheck={false}
                onBlur={onBlur}
            />
            <Validators themeLinks={settings.themeLinks} />
        </>
    );
});
