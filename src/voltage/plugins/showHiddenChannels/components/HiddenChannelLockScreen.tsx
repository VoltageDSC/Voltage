/*!
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
import { LazyComponent } from "@utils/Misc";
import { proxyLazy } from "@utils/ProxyLazy";
import { formatDuration } from "@utils/Text";
import { find, findByCode, findByPropsLazy, findLazy } from "@webpack";
import { moment, Parser, SnowflakeUtils, Text, Timestamp, Tooltip } from "@webpack/common";
import { Channel } from "discord-types/general";

enum SortOrderTypesTyping {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1
}

enum ForumLayoutTypesTyping {
    DEFAULT = 0,
    LIST = 1,
    GRID = 2
}

interface DefaultReaction {
    emojiId: string | null;
    emojiName: string | null;
}

interface Tag {
    id: string;
    name: string;
    emojiId: string | null;
    emojiName: string | null;
    moderated: boolean;
}

interface ExtendedChannel extends Channel {
    defaultThreadRateLimitPerUser?: number;
    defaultSortOrder?: SortOrderTypesTyping | null;
    defaultForumLayout?: ForumLayoutTypesTyping;
    defaultReactionEmoji?: DefaultReaction | null;
    availableTags?: Array<Tag>;
}

const ChatClasses = findByPropsLazy("chat", "chatContent");
const TagClasses = findLazy(m => typeof m.tags === "string" && Object.entries(m).length === 1); // Object exported with a single key called tags
const ChannelTypes = findByPropsLazy("GUILD_TEXT", "GUILD_FORUM");
const SortOrderTypes = findLazy(m => typeof m.LATEST_ACTIVITY === "number");
const ForumLayoutTypes = findLazy(m => typeof m.LIST === "number");
const ChannelFlags = findLazy(m => typeof m.REQUIRE_TAG === "number");
const TagComponent = LazyComponent(() => find(m => {
    if (typeof m !== "function") return false;

    const code = Function.prototype.toString.call(m);
    // Get the component which doesn't include increasedActivity logic
    return code.includes(".Messages.FORUM_TAG_A11Y_FILTER_BY_TAG") && !code.includes("increasedActivityPill");
}));
const EmojiComponent = LazyComponent(() => findByCode('.jumboable?"jumbo":"default"'));

const ChannelTypesToChannelNames = proxyLazy(() => ({
    [ChannelTypes.GUILD_TEXT]: "text",
    [ChannelTypes.GUILD_ANNOUNCEMENT]: "announcement",
    [ChannelTypes.GUILD_FORUM]: "forum"
}));

const SortOrderTypesToNames = proxyLazy(() => ({
    [SortOrderTypes.LATEST_ACTIVITY]: "Latest activity",
    [SortOrderTypes.CREATION_DATE]: "Creation date"
}));

const ForumLayoutTypesToNames = proxyLazy(() => ({
    [ForumLayoutTypes.DEFAULT]: "Not set",
    [ForumLayoutTypes.LIST]: "List view",
    [ForumLayoutTypes.GRID]: "Gallery view"
}));

// Icon from the modal when clicking a message link you don't have access to view
const HiddenChannelLogo = "/assets/433e3ec4319a9d11b0cbe39342614982.svg";

function HiddenChannelLockScreen({ channel }: { channel: ExtendedChannel; }) {
    const {
        type,
        topic,
        lastMessageId,
        defaultForumLayout,
        lastPinTimestamp,
        defaultAutoArchiveDuration,
        availableTags,
        id: channelId,
        rateLimitPerUser,
        defaultThreadRateLimitPerUser,
        defaultSortOrder,
        defaultReactionEmoji
    } = channel;

    return (
        <div className={ChatClasses.chat + " " + "shc-lock-screen-container"}>
            <img className="shc-lock-screen-logo" src={HiddenChannelLogo} />

            <div className="shc-lock-screen-heading-container">
                <Text variant="heading-xxl/bold">This is a hidden {ChannelTypesToChannelNames[type]} channel.</Text>
                {channel.isNSFW() &&
                    <Tooltip text="NSFW">
                        {({ onMouseLeave, onMouseEnter }) => (
                            <svg
                                onMouseLeave={onMouseLeave}
                                onMouseEnter={onMouseEnter}
                                className="shc-lock-screen-heading-nsfw-icon"
                                width="32"
                                height="32"
                                viewBox="0 0 48 48"
                                aria-hidden={true}
                                role="img"
                            >
                                <path d="M.7 43.05 24 2.85l23.3 40.2Zm23.55-6.25q.75 0 1.275-.525.525-.525.525-1.275 0-.75-.525-1.3t-1.275-.55q-.8 0-1.325.55-.525.55-.525 1.3t.55 1.275q.55.525 1.3.525Zm-1.85-6.1h3.65V19.4H22.4Z" />
                            </svg>
                        )}
                    </Tooltip>
                }
            </div>

            <Text variant="text-lg/normal">
                You can not see the {channel.isForumChannel() ? "posts" : "messages"} of this channel.
                {channel.isForumChannel() && topic && topic.length > 0 && "However you may see its guidelines:"}
            </Text >

            {channel.isForumChannel() && topic && topic.length > 0 && (
                <div className="shc-lock-screen-topic-container">
                    {Parser.parseTopic(topic, false, { channelId })}
                </div>
            )}

            {lastMessageId &&
                <Text variant="text-md/normal">
                    Last {channel.isForumChannel() ? "post" : "message"} created:
                    <Timestamp timestamp={moment(SnowflakeUtils.extractTimestamp(lastMessageId))} />
                </Text>
            }

            {lastPinTimestamp &&
                <Text variant="text-md/normal">Last message pin: <Timestamp timestamp={moment(lastPinTimestamp)} /></Text>
            }
            {(rateLimitPerUser ?? 0) > 0 &&
                <Text variant="text-md/normal">Slowmode: {formatDuration(rateLimitPerUser! * 1000)}</Text>
            }
            {(defaultThreadRateLimitPerUser ?? 0) > 0 &&
                <Text variant="text-md/normal">
                    Default thread slowmode: {formatDuration(defaultThreadRateLimitPerUser! * 1000)}
                </Text>
            }
            {(defaultAutoArchiveDuration ?? 0) > 0 &&
                <Text variant="text-md/normal">
                    Default inactivity duration before archiving {channel.isForumChannel() ? "posts" : "threads"}:
                    {formatDuration(defaultAutoArchiveDuration! * 1000 * 60)}
                </Text>
            }
            {defaultForumLayout != null &&
                <Text variant="text-md/normal">Default layout: {ForumLayoutTypesToNames[defaultForumLayout]}</Text>
            }
            {defaultSortOrder != null &&
                <Text variant="text-md/normal">Default sort order: {SortOrderTypesToNames[defaultSortOrder]}</Text>
            }
            {defaultReactionEmoji != null &&
                <div className="shc-lock-screen-default-emoji-container">
                    <Text variant="text-md/normal">Default reaction emoji:</Text>
                    <EmojiComponent node={{
                        type: defaultReactionEmoji.emojiName ? "emoji" : "customEmoji",
                        name: defaultReactionEmoji.emojiName ?? "",
                        emojiId: defaultReactionEmoji.emojiId
                    }} />
                </div>
            }
            {channel.hasFlag(ChannelFlags.REQUIRE_TAG) &&
                <Text variant="text-md/normal">Posts on this forum require a tag to be set.</Text>
            }
            {availableTags && availableTags.length > 0 &&
                <div className="shc-lock-screen-tags-container">
                    <Text variant="text-lg/bold">Available tags:</Text>
                    <div className={TagClasses.tags}>
                        {availableTags.map(tag => <TagComponent tag={tag} />)}
                    </div>
                </div>
            }
        </div>
    );
}

export default ErrorBoundary.wrap(HiddenChannelLockScreen);
