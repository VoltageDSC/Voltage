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
import ErrorBoundary from "@components/errors/ErrorBoundary";
import { Devs } from "@constants";
import definePlugin, { OptionType } from "@types";
import { Button, UserStore } from "@webpack/common";
import { User } from "discord-types/general";

import ReviewsView from "./components/ReviewsView";
import { getLastReviewID } from "./Utils/ReviewDBAPI";
import { authorize, showToast } from "./Utils/Utils";

export default definePlugin({
    name: "ReviewDB",
    description: "Shows you the reviews of a user in their user popout. Reviews by ReviewDB.",
    authors: [Devs.Sappy],

    patches: [
        {
            find: "disableBorderColor:!0",
            replacement: {
                match: /\(.{0,10}\{user:(.),setNote:.,canDM:.,.+?\}\)/,
                replace: "$&,Voltage.Plugins.plugins.ReviewDB.getReviewsComponent($1)"
            },
        }
    ],

    options: {
        authorize: {
            type: OptionType.COMPONENT,
            description: "Authorise with ReviewDB",
            component: () => (
                <Button onClick={authorize}>
                    Authorise with ReviewDB
                </Button>
            )
        },
        notifyReviews: {
            type: OptionType.BOOLEAN,
            description: "Notify about new reviews on startup",
            default: true,
        }
    },

    async start() {
        const settings = Settings.plugins.ReviewDB;
        if (!settings.lastReviewId || !settings.notifyReviews) return;

        setTimeout(async () => {
            const id = await getLastReviewID(UserStore.getCurrentUser().id);
            if (settings.lastReviewId < id) {
                showToast("You have new reviews on your profile!");
                settings.lastReviewId = id;
            }
        }, 4000);
    },

    getReviewsComponent: (user: User) => (
        <ErrorBoundary message="Failed to render Reviews">
            <ReviewsView userId={user.id} />
        </ErrorBoundary>
    )
});
