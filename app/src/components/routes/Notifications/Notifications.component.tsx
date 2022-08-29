import React, { FunctionComponent, useEffect } from 'react';
import { useQuery, useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { YOUR_NOTIFICATIONS, MARK_UNSEEN_NOTIFICATIONS_AS_SEEN } from "@state/Notifications/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';

import DropAnimation from '@components/shared/DropAnimation';
import CogSVG from "@shared/Icons/Cog.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';
import { Notification } from './Notification/Notification.component';

export const Notifications: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();
    // const { liquidUser } = useAuthUser();

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
                    when={n.lastEditOn}
                    seen={n.seen}
                />
            ))}

            {(yourNotifications_data?.YourNotifications?.length === 0) && (
                <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                    <div className="p-4 text-center">
                        No notifications yet
                    </div>
                </div>
            )}

            {(yourNotifications_loading) && (
                <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                    <DropAnimation />
                </div>
            )}

            {/* <Notification
                user={liquidUser}
                type="voted_on_a_poll_you_voted"
            />
            <Notification
                user={liquidUser}
                type="followed_you"
            />
            <Notification
                user={liquidUser}
                type="invited_you_to_vote_on_a_poll"
            />
            <Notification
                user={liquidUser}
                type="voted_on_a_poll_you_created"
            />
            <Notification
                user={liquidUser}
                type="invited_you_to_join_group"
            /> */}

            {/* {[...Array(10).keys()].map((k) => (
                <>
                    <Notification
                        key={k}
                        user={liquidUser}
                    />
                </>
            ))} */}
            {/* <div className='d-flex justify-content-center'>
                <button className='button_' onClick={getToken_}>allow notifications</button>
            </div> */}

            {/* <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${!section && 'active'}`} to={`/notifications`}>
                        Yours
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'representatives' && 'active'}`} to={`/notifications/representatives`}>
                        Representatives
                    </Link>
                </li>
            </ul> */}




            {/* <br />
            <pre>{JSON.stringify(yourNotifications_data?.YourNotifications, null, 2)}</pre> */}


        </>
    );
}

