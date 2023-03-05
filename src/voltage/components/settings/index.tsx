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

import "./styles/main.css";

import { classNameFactory } from "@api/Styles";
import ErrorBoundary from "@components/errors/ErrorBoundary";
import { handleComponentFailed } from "@components/handleComponentFailed";
import { findByCodeLazy } from "@webpack";
import { Forms, SettingsRouter, Text } from "@webpack/common";

import BackupRestoreTab from "./tabs/BackupRestoreTab";
import PluginsTab from "./tabs/PluginsTab";
import ThemesTab from "./tabs/ThemesTab";
import Updater from "./tabs/Updater";
import VoltageTab from "./tabs/VoltageTab";

const cl = classNameFactory("voltage-settings-");

const TabBar = findByCodeLazy('[role="tab"][aria-disabled="false"]');

interface SettingsProps {
    tab: string;
}

interface SettingsTab {
    name: string;
    component?: React.ComponentType;
}

const SettingsTabs: Record<string, SettingsTab> = {
    VoltageSettings: { name: "Settings", component: () => <VoltageTab /> },
    VoltagePlugins: { name: "Plugins", component: () => <PluginsTab /> },
    VoltageThemes: { name: "Themes", component: () => <ThemesTab /> },
    VoltageUpdater: { name: "Updater" },
    VoltageSettingsSync: { name: "Backup & Restore", component: () => <BackupRestoreTab /> },
};

if (!IS_WEB) SettingsTabs.VoltageUpdater.component = () => Updater && <Updater />;

function Settings(props: SettingsProps) {
    const { tab = "VoltageSettings" } = props;

    const CurrentTab = SettingsTabs[tab]?.component;

    return <Forms.FormSection>
        <Text variant="heading-md/normal" className={cl("title")} tag="h2">Voltage</Text>

        <TabBar
            type={"top"}
            look={"brand"}
            className={cl("tab")}
            selectedItem={tab}
            onItemSelect={SettingsRouter.open}
        >
            {Object.entries(SettingsTabs).map(([key, { name, component }]) => {
                if (!component) return null;
                return <TabBar.Item
                    id={key}
                    className={cl("tabItem")}
                    key={key}>
                    {name}
                </TabBar.Item>;
            })}
        </TabBar>
        <Forms.FormDivider />
        {CurrentTab && <CurrentTab />}
    </Forms.FormSection >;
}

export default function (props: SettingsProps) {
    return <ErrorBoundary onError={handleComponentFailed}>
        <Settings tab={props.tab} />
    </ErrorBoundary>;
}
