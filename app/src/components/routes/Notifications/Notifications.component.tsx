import React, { FunctionComponent, useEffect } from 'react';
import { useQuery, useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { YOUR_NOTIFICATIONS, MARK_UNSEEN_NOTIFICATIONS_AS_SEEN } from "@state/Notifications/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';

import DropAnimation from '@components/shared/DropAnimation';
import CogSVG from "@shared/Icons/Cog.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import MetaTags from "@components/shared/MetaTags";

import './style.sass';
import { Notification } from './Notification/Notification.component';

export const Notifications: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();
    const { liquidUser } = useAuthUser();

    const {
        loading: yourNotifications_loading,
        error: yourNotifications_error,
        data: yourNotifications_data,
        refetch: yourNotifications_refetch
    } = useQuery(YOUR_NOTIFICATIONS);

    const [markUnseenNotificationsAsSeen, {
        loading: markUnseenNotificationsAsSeen_loading,
        error: markUnseenNotificationsAsSeen_error,
        data: markUnseenNotificationsAsSeen_data,
    }] = useMutation(MARK_UNSEEN_NOTIFICATIONS_AS_SEEN);

    useEffect(() => {
        if (yourNotifications_data?.YourNotifications?.length) {
            setTimeout(() => markUnseenNotificationsAsSeen(), 3000);
        }

    }, [yourNotifications_data?.YourNotifications])

    return (
        <>
            <MetaTags
                title="Notifications - Liquid Vote"
                description="Where opinions are found"
                image="https://images.liquid-vote.com/system/logo.png"
            />

            <Header
                title="Notifications"
                rightElement={() => (
                    <div onClick={() => updateParams({
                        paramsToAdd: {
                            modal: "NotificationSettings",
                        }
                    })} className="pointer">
                        <CogSVG />
                    </div>
                )}
            />

            <br />

            {yourNotifications_data?.YourNotifications?.map((n: any) => (
                <Notification
                    user={n.user}
                    type={n.type}
                    question={n.question}
                    choiceText={n.choiceText}
                    group={n.group}
                    agreesWithYou={n.agreesWithYou}
                    actionUser={n.actionUser}
                    inviterUser={n.inviterUser}
                    when={n.lastEditOn}
                    seen={n.seen}
                    liquidUserHandle={liquidUser?.handle}
                />
            ))}

            {(yourNotifications_data?.YourNotifications?.length === 0) && (
                <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                    <div className="p-4 text-center">
                        No notifications yet
                    </div>
                </div>
            )}

            {(!yourNotifications_data || yourNotifications_loading) && (
                <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                    <DropAnimation />
                </div>
            )}
        </>
    );
}

