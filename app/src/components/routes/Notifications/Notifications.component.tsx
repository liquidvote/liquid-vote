import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";

import Header from "@shared/Header";
import { VOTES } from "@state/Vote/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import Notification from '@shared/Notification';
import DropAnimation from '@components/shared/DropAnimation';

import './style.sass';


export const Notifications: FunctionComponent<{}> = ({ }) => {

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
            <Header title="Notifications" />

            {user_votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            <br />
            {/* <pre>{ JSON.stringify(user_votes_data, null, 2) }</pre> */}

            {user_votes_data?.Votes.map((n, i) => (
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
            ))}
        </>
    );
}

