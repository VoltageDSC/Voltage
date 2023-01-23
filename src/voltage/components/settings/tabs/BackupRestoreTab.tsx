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

import ErrorBoundary from "@components/errors/ErrorBoundary";
import { Flex } from "@components/Flex";
import { classes } from "@utils/Misc";
import { downloadSettingsBackup, uploadSettingsBackup } from "@utils/SettingsSync";
import { Button, Card, Forms, Margins, Text } from "@webpack/common";

function BackupRestoreTab() {
    return (
        <Forms.FormSection title="Settings Sync">
            <Card className={classes("voltage-settings-card", "voltage-backup-restore")}>
                <Flex flexDirection="column">
                    <strong>Warning</strong>
                    <span>Importing a settings file will overwrite your current settings.</span>
                </Flex>
            </Card>
            <Text variant="text-md/normal" className={Margins.marginBottom8}>
                You can import and export your Voltage settings as a JSON file.
                This allows you to easily transfer your settings to another device,
                or recover your settings after reinstalling Voltage or Discord.
            </Text>
            <Forms.FormDivider />
            <Text variant="text-md/normal" className={Margins.marginBottom8}>
                <b>Settings Export Contains:</b>
                <Forms.FormDivider />
                <ul>
                    <li>&mdash; Custom CSS</li>
                    <li>&mdash; Plugin Settings</li>
                </ul>
            </Text>
            <Forms.FormDivider />
            <Flex>
                <Button
                    onClick={uploadSettingsBackup}
                    size={Button.Sizes.SMALL}
                >
                    Import Settings
                </Button>
                <Button
                    onClick={downloadSettingsBackup}
                    size={Button.Sizes.SMALL}
                >
                    Export Settings
                </Button>
            </Flex>
        </Forms.FormSection>
    );
}

export default ErrorBoundary.wrap(BackupRestoreTab);
