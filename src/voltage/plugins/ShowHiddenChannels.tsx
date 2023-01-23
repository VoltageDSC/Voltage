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

import { Settings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/Modal";
import { Button, ChannelStore, PermissionStore, SnowflakeUtils, Text } from "@webpack/common";

const CONNECT = 1048576n;
const VIEW_CHANNEL = 1024n;

export default definePlugin({
    name: "Show Hidden Channels",
    description: "Reveals role restricted channels however you can't read them.",
    authors: [Devs.Sappy],
    options: {
        hideUnreads: {
            description: "Hide unreads",
            type: OptionType.BOOLEAN,
            default: true,
            restartNeeded: true
        }
    },
    patches: [
        {
            find: ".CannotShow",
            replacement: {
                match: /renderLevel:(\w+)\.CannotShow/g,
                replace: "renderLevel:Voltage.Plugins.plugins[\"Show Hidden Channels\"].shouldShow(this.record, this.category, this.isMuted)?$1.Show:$1.CannotShow"
            }
        },
        {
            find: ".handleThreadsPopoutClose();",
            replacement: {
                match: /((\w)\.handleThreadsPopoutClose\(\);)/g,
                replace: "if(arguments[0].button===0&&Voltage.Plugins.plugins[\"Show Hidden Channels\"].channelSelected($2?.props?.channel))return;$1"
            }
        },
        {
            find: ".prototype.shouldShowEmptyCategory=function(){",
            replacement: {
                match: /(\.prototype\.shouldShowEmptyCategory=function\(\){)/g,
                replace: "$1return true;"
            }
        },
        {
            find: "?\"button\":\"link\"",
            predicate: () => Settings.plugins["Show Hidden Channels"].hideUnreads === true,
            replacement: {
                match: /(\w)\.connected,(\w)=(\w\.unread),(\w=\w\.canHaveDot)/g,
                replace: "$1.connected,$2=Voltage.Plugins.plugins[\"Show Hidden Channels\"].isHiddenChannel($1.channel)?false:$3,$4"
            }
        },
        {
            find: '.displayName="ChannelListUnreadsStore"',
            replacement: {
                match: /((.)\.getGuildId\(\))(&&\(!\(.\.isThread.{1,100}\.hasRelevantUnread\()/,
                replace: "$1&&!$2._isHiddenChannel$3"
            }
        },
        {
            find: ".rulesChannelId))",
            replacement: {
                match: /(\.locked.{0,400})(switch\((\i)\.type\))/,
                replace: "$1 if($3._isHiddenChannel)return $self.LockIcon;$2"
            }
        }
    ],

    shouldShow(channel, category, isMuted) {
        if (!this.isHiddenChannel(channel)) return false;
        if (!category) return false;
        if (channel.type === 0 && category.guild?.hideMutedChannels && isMuted) return false;

        return !category.isCollapsed;
    },

    isHiddenChannel(channel) {
        if (!channel) return false;
        if (channel.channelId)
            channel = ChannelStore.getChannel(channel.channelId);
        if (!channel || channel.isDM() || channel.isGroupDM() || channel.isMultiUserDM())
            return false;

        channel._isHiddenChannel = !PermissionStore.can(VIEW_CHANNEL, channel) || (channel.type === 2 && !PermissionStore.can(CONNECT, channel));
        return channel._isHiddenChannel;
    },

    channelSelected(channel) {
        if (!channel) return false;
        const isHidden = this.isHiddenChannel(channel);
        if (channel.type === 0 && isHidden) {
            const lastMessageDate = channel.lastMessageId ? new Date(SnowflakeUtils.extractTimestamp(channel.lastMessageId)).toLocaleString() : null;
            openModal(modalProps => (
                <ModalRoot size={ModalSize.SMALL} {...modalProps}>
                    <ModalHeader>
                        <Flex>
                            <Text variant="heading-md/bold">{channel.name}</Text>
                        </Flex>
                    </ModalHeader>
                    <ModalContent style={{ marginBottom: 10, marginTop: 10, marginRight: 8, marginLeft: 8 }}>
                        <Text variant="text-md/normal">You don't have the permission to view the messages in this channel.</Text>
                        {(channel.topic || "").length > 0 && (
                            <>
                                <Text variant="text-md/bold" style={{ marginTop: 10 }}>
                                    Topic:
                                </Text>
                                <Text variant="code">{channel.topic}</Text>
                            </>
                        )}
                        {lastMessageDate && (
                            <>
                                <Text variant="text-md/bold" style={{ marginTop: 10 }}>
                                    Last message sent:
                                </Text>
                                <Text variant="code">{lastMessageDate}</Text>
                            </>
                        )}
                    </ModalContent>
                    <ModalFooter>
                        <Flex>
                            <Button
                                onClick={modalProps.onClose}
                                size={Button.Sizes.SMALL}
                                color={Button.Colors.PRIMARY}
                            >
                                Close
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalRoot>
            ));
        }
        return isHidden;
    },

    LockIcon: () => (
        <svg
            height="18"
            width="20"
            viewBox="0 0 24 24"
        >
            <path fill="var(--channel-icon)" d="M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z" />
        </svg>
    )
});
