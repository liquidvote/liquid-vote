import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { VOTES } from "@state/Vote/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import Notification from '@shared/Notification';
import DropAnimation from '@components/shared/DropAnimation';
import CogSVG from "@shared/Icons/Cog.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Notifications: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();
    const { liquidUser } = useAuthUser();

    const {
        loading: user_votes_loading,
        error: user_votes_error,
        data: user_votes_data,
        refetch: user_votes_refetch
    } = useQuery(VOTES, {
        variables: {
            userHandle: liquidUser?.handle,
            type: 'indirectVotesMadeForUser',
            sortBy: 'time'
        }
    });

    // console.log({
    //     user_votes_data
    // });

    return (
        <>
            <Header
                title="Notifications"
                rightElement={() => (
                    <div onClick={() => updateParams({
                        paramsToAdd: {
                            modal: "NotificationSettings",
                            // modalData: JSON.stringify({
                            //     questionText,
                            //     choiceText,
                            //     groupHandle,
                            //     subsection: 'total',
                            //     // subsubsection: 'foryou'
                            // })
                        }
                    })} className="pointer">
                        <CogSVG />
                    </div>
                )}
            />

            <p className="text-center py-4">
                    🏗 Ignore these for now please
            </p>

            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
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
            </ul>


            {user_votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            <br />
            {/* <pre>{ JSON.stringify(user_votes_data, null, 2) }</pre> */}

            {!section && (
                <div>Hum</div>
            )}

            {section === 'representatives' && (
                user_votes_data?.Votes.map((n, i) => (
                    <>
                        <Notification
                            key={'notification-uservote' + n.user?.handle + n.questionText + n.choiceText}
                            v={{
                                ...n,
                                // user: profile
                            }}
                            showChart={true}
                        />
                    </>
                ))
            )}

            {(!user_votes_data?.Votes?.length) && (
                <div className="p-4 text-center">{`You haven't been represented on any Polls yet`}</div>
            )}
        </>
    );
}

