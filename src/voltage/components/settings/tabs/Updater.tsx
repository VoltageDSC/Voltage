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

import ErrorBoundary from "@components/errors/ErrorBoundary";
import { ErrorCard } from "@components/errors/ErrorCard";
import { Flex } from "@components/Flex";
import { handleComponentFailed } from "@components/handleComponentFailed";
import { Link } from "@components/Link";
import { classes, useAwaiter } from "@utils/Misc";
import { changes, checkForUpdates, getRepo, isNewer, rebuild, update, updateError, UpdateLogger } from "@utils/Updater";
import { Alerts, Button, Card, Forms, Margins, Parser, React, Toasts } from "@webpack/common";

import gitHash from "~git-hash";

function withDispatcher(dispatcher: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
    return async () => {
        dispatcher(true);
        try {
            await action();
        } catch (e: any) {
            UpdateLogger.error("Failed to update", e);
            if (!e) {
                var err = "An unknown error occurred (error is undefined).\nPlease try again.";
            } else if (e.code && e.cmd) {
                const { code, path, cmd, stderr } = e;

                if (code === "ENOENT")
                    var err = `Command \`${path}\` not found.\nPlease install it and try again`;
                else {
                    var err = `An error occured while running \`${cmd}\`:\n`;
                    err += stderr || `Code \`${code}\`. See the console for more info`;
                }

            } else {
                var err = "An unknown error occurred. See the console for more info.";
            }
            Alerts.show({
                title: "Oops!",
                body: (
                    <ErrorCard>
                        {err.split("\n").map(line => <div>{Parser.parse(line)}</div>)}
                    </ErrorCard>
                )
            });
        }
        finally {
            dispatcher(false);
        }
    };
}

interface CommonProps {
    repo: string;
    repoPending: boolean;
}

function HashLink({ repo, hash, disabled = false }: { repo: string, hash: string, disabled?: boolean; }) {
    return <Link href={`${repo}/commit/${hash}`} disabled={disabled}>
        {hash}
    </Link>;
}

function Changes({ updates, repo, repoPending }: CommonProps & { updates: typeof changes; }) {
    return (
        <Card style={{ padding: ".5em" }}>
            {updates.map(({ hash, author, message }) => (
                <div>
                    <code><HashLink {...{ repo, hash }} disabled={repoPending} /></code>
                    <span style={{
                        marginLeft: "0.5em",
                        color: "var(--text-normal)"
                    }}>{message} - {author}</span>
                </div>
            ))}
        </Card>
    );
}

function Updatable(props: CommonProps) {
    const [updates, setUpdates] = React.useState(changes);
    const [isChecking, setIsChecking] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const isOutdated = (updates?.length ?? 0) > 0;

    return (
        <>
            {!updates && updateError ? (
                <>
                    <Forms.FormText>Failed to check updates. Check the console for more info</Forms.FormText>
                    <ErrorCard style={{ padding: "1em" }}>
                        <p>{updateError.stderr || updateError.stdout || "An unknown error occurred"}</p>
                    </ErrorCard>
                </>
            ) : (
                <Forms.FormText className={Margins.marginBottom8}>
                    {isOutdated ? `${updates.length} Updates Available` : "Latest Version"}
                </Forms.FormText>
            )}

            {isOutdated && <Changes updates={updates} {...props} />}

            <Forms.FormDivider />

            <Flex className={classes(Margins.marginBottom8, Margins.marginTop8)}>
                {isOutdated && <Button
                    size={Button.Sizes.SMALL}
                    disabled={isUpdating || isChecking}
                    onClick={withDispatcher(setIsUpdating, async () => {
                        if (await update()) {
                            setUpdates([]);
                            const needFullRestart = await rebuild();
                            await new Promise<void>(r => {
                                Alerts.show({
                                    title: "Update Success!",
                                    body: "Successfully Updated. Would you like to restart now to apply the changes?",
                                    confirmText: "Restart",
                                    cancelText: "Later!",
                                    onConfirm() {
                                        if (needFullRestart)
                                            window.DiscordNative.app.relaunch();
                                        else
                                            location.reload();
                                        r();
                                    },
                                    onCancel: r
                                });
                            });
                        }
                    })}
                >
                    Update Now
                </Button>}
                <Button
                    size={Button.Sizes.SMALL}
                    disabled={isUpdating || isChecking}
                    onClick={withDispatcher(setIsChecking, async () => {
                        const outdated = await checkForUpdates();
                        if (outdated) {
                            setUpdates(changes);
                        } else {
                            setUpdates([]);
                            Toasts.show({
                                message: "No Updates Found",
                                id: Toasts.genId(),
                                type: Toasts.Type.MESSAGE,
                                options: {
                                    position: Toasts.Position.BOTTOM
                                }
                            });
                        }
                    })}
                >
                    Check for Updates
                </Button>
            </Flex>
        </>
    );
}

function Newer(props: CommonProps) {
    return (
        <>
            <Forms.FormText className={Margins.marginBottom8}>
                Your local copy has more recent commits. Please stash or reset them.
            </Forms.FormText>
            <Changes {...props} updates={changes} />
        </>
    );
}

function Updater() {
    const [repo, err, repoPending] = useAwaiter(getRepo, { fallbackValue: "Loading..." });

    React.useEffect(() => {
        if (err)
            UpdateLogger.error("Failed to retrieve repo", err);
    }, [err]);

    const commonProps: CommonProps = {
        repo,
        repoPending
    };

    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h5">Repo</Forms.FormTitle>

            <Forms.FormText>{repoPending ? repo : err ? "Failed to retrieve - check console" : (
                <Link href={repo}>
                    {repo.split("/").slice(-2).join("/")}
                </Link>
            )} (<HashLink hash={gitHash} repo={repo} disabled={repoPending} />)</Forms.FormText>

            <Forms.FormDivider />

            <Forms.FormTitle tag="h5">Updates</Forms.FormTitle>

            {isNewer ? <Newer {...commonProps} /> : <Updatable {...commonProps} />}
        </Forms.FormSection >
    );
}

export default IS_WEB ? null : ErrorBoundary.wrap(Updater, {
    message: "Failed to render the Updater. If this persists, try using the installer to reinstall!",
    onError: handleComponentFailed,
});
