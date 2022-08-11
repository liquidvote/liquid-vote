import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { YOUR_NOTIFICATIONS } from "@state/Notifications/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
// import { useFirebaseNotifications } from "@services/firebase";

import DropAnimation from '@components/shared/DropAnimation';
import CogSVG from "@shared/Icons/Cog.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";

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

    console.log({
        yourNotifications_data
    });

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
                    user={n.actionUser}
                    type={n.type}
                    question={n.question}
                    choiceText={n.choiceText}
                    group={n.group}
                    agreesWithYou={n.agreesWithYou}
                    when={n.lastEditOn}
                    seen={n.seen}
                />
            ))}

            <Notification
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
            />

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




            <br />
            <pre>{JSON.stringify(yourNotifications_data?.YourNotifications, null, 2)}</pre>


        </>
    );
}

