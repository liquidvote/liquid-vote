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
            type: 'indirectVotes',
            sortBy: 'time'
        }
    });

    return (
        <>
            <Header title="Notifications" />

            {user_votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

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

