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

import { useSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import DonateButton from "@components/DonateButton";
import ErrorBoundary from "@components/errors/ErrorBoundary";
import IpcEvents from "@utils/IPC";
import { useAwaiter } from "@utils/Misc";
import { Button, Card, Forms, Margins, React, Switch } from "@webpack/common";

const cl = classNameFactory("voltage-settings-");

function Settings() {
    const [settingsDir, settingsDirPending] = useAwaiter(() => VoltageNative.ipc.invoke<string>(IpcEvents.GET_SETTINGS_DIR), {
        fallbackValue: "Loading..."
    });
    const settings = useSettings();

    return (
        <React.Fragment>
            <DonateCard />
            <Forms.FormSection title="Quick Actions">
                <Card className={cl("actions")}>
                    {IS_WEB ? (
                        <Button
                            onClick={() => require("../../customcss/Monaco").launchMonacoEditor()}
                            size={Button.Sizes.SMALL}
                            disabled={settingsDir === "Loading..."}>
                            Open Custom CSS
                        </Button>
                    ) : (
                        <React.Fragment>
                            <Button
                                onClick={() => window.DiscordNative.app.relaunch()}
                                size={Button.Sizes.SMALL}>
                                Restart Client
                            </Button>
                            <Button
                                onClick={() => VoltageNative.ipc.invoke(IpcEvents.OPEN_MONACO_EDITOR)}
                                size={Button.Sizes.SMALL}
                                disabled={settingsDir === "Loading..."}>
                                Open Custom CSS
                            </Button>
                            <Button
                                onClick={() => window.DiscordNative.fileManager.showItemInFolder(settingsDir)}
                                size={Button.Sizes.SMALL}
                                disabled={settingsDirPending}>
                                Open Settings Folder
                            </Button>
                            <Button
                                onClick={() => VoltageNative.ipc.invoke(IpcEvents.OPEN_EXTERNAL, "https://codeberg.org/Voltage/Voltage")}
                                size={Button.Sizes.SMALL}
                                disabled={settingsDirPending}>
                                Open Repository
                            </Button>
                        </React.Fragment>
                    )}
                </Card>
            </Forms.FormSection>

            <Forms.FormDivider />

            <Forms.FormSection className={Margins.marginTop16} title="Settings">
                <Forms.FormText className={Margins.marginBottom20}>
                    Hint: You can change the position of this settings section in the settings of the "Settings" plugin!
                </Forms.FormText>
                <Switch
                    value={settings.CustomCSS}
                    onChange={(v: boolean) => settings.CustomCSS = v}
                    note="Enables loading styles from your Custom CSS file">
                    Use Custom CSS
                </Switch>
                {!IS_WEB && (
                    <React.Fragment>
                        <Switch
                            value={settings.ReactDevTools}
                            onChange={(v: boolean) => settings.ReactDevTools = v}
                            note="Injects your local installation of React Developer Tools into Discord">
                            React Developer Tools
                        </Switch>
                        <Switch
                            value={settings.ShowToasts}
                            onChange={(v: boolean) => settings.ShowToasts = v}
                            note="Shows a small notification for important information">
                            Show Toasts
                        </Switch>
                        <Switch
                            value={settings.frameless}
                            onChange={(v: boolean) => settings.frameless = v}
                            note="Adds the native os window frame to the main window">
                            Frameless
                        </Switch>
                        <Switch
                            value={settings.transparent}
                            onChange={(v: boolean) => settings.transparent = v}
                            note="Allows the window to become transparent.">
                            Enable window transparency
                        </Switch>
                    </React.Fragment>
                )}

            </Forms.FormSection>
        </React.Fragment>
    );
}

function DonateCard() {
    return (
        <Card className={cl("card", "donate")}>
            <div>
                <Forms.FormTitle tag="h5">Support the Project</Forms.FormTitle>
                <Forms.FormText>Please consider supporting the development of Voltage by donating!</Forms.FormText>
                <DonateButton style={{ transform: "translateX(-1em)" }} />
            </div>
            <img
                role="presentation"
                src="https://i.imgur.com/a0wxd6D.png"
                alt=""
                height={80}
                style={{ marginLeft: "auto", transform: "rotate(10deg)" }}
            />
        </Card>
    );
}

export default ErrorBoundary.wrap(Settings);
