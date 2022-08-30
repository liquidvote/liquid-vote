import React, { FunctionComponent, useState } from 'react';
import { useQuery } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { USER } from "@state/User/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import DropAnimation from '@components/shared/DropAnimation';
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";

import './style.sass';

export const GroupInProfileListVotes: FunctionComponent<{
    userHandle?: string,
    groupHandle?: string,
    subsection?: string,
    subsubsection?: string
    inviterHandle?: string
}> = ({
    userHandle,
    groupHandle,
    subsection,
    subsubsection,
    inviterHandle
}) => {

    // let { section, subsection, subsubsection, handle, groupHandle } = useParams<any>();

    const [sortBy, setSortBy] = useState('time');

    const { liquidUser } = useAuthUser();

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle: userHandle }
    });

    const profile = user_data?.User;

    const type = (() => {
        if ((!subsection || subsection === 'direct') && !subsubsection) {
            return 'directVotesMade';
        } else if (subsubsection === 'same') {
            return 'directVotesInAgreement';
        } else if (subsubsection === 'different') {
            return 'directVotesInDisagreement';
        } else if (subsection === 'represented' && !subsubsection) {
            return 'indirectVotesMadeForUser'
        } else if (subsection === 'represented' && subsubsection === 'byyou') {
            return 'indirectVotesMadeByYou';
        } else if (subsection === 'represented' && subsubsection === 'foryou') {
            return 'indirectVotesMadeForYou';
        }
        return 'type'
    })();

    const {
        loading: user_votes_loading,
        error: user_votes_error,
        data: user_votes_data,
        refetch: user_votes_refetch
    } = useQuery(VOTES, {
        variables: {
            userHandle,
            ...groupHandle && { groupHandle },
            type,
            sortBy
        },
        // fetchPolicy: "no-cache"
    });

    return (
        <div className="mx-2 mb-5">

            {user_votes_data?.Votes.length === 0 && (
                <div className="p-4 text-center">
                    {user_data?.User?.name}{' '}
                    {
                        (() => {
                            if (type === 'directVotesMade') {
                                return 'hasn\'t answered directly to any polls';
                            } else if (type === 'directVotesInAgreement') {
                                return 'hasn\'t agreed with you on any polls';
                            } else if (type === 'directVotesInDisagreement') {
                                return 'hasn\'t disagreed with you on any polls';
                            } else if (type === 'indirectVotesMadeForUser') {
                                return 'hasn\'t been represented on any polls'
                            } else if (type === 'indirectVotesMadeByYou') {
                                return 'hasn\'t been represented by you on any polls';
                            } else if (type === 'indirectVotesMadeForYou') {
                                return 'hasn\'t represented you on any polls';
                            }
                            return 'type'
                        })()
                    }{' '}
                    yet
                </div>
            )}

            {user_votes_data?.Votes.map((n, i) => (
                <div className='mt-3' key={'uservote' + n.questionText + type + n.choiceText + profile.handle}>
                    {
                        n.question.questionType === 'multi' && (
                            <MultiVoteInList
                                key={`multi-${n.questionText}`}
                                v={{
                                    ...n.question
                                }}
                                user={profile}
                                showGroupAndTime={true}
                                inviterHandle={inviterHandle}
                            />
                        )
                    }
                    {
                        n.question.questionType === 'single' && (
                            <SingleVoteInList
                                key={`single-${n.questionText}`}
                                l={{
                                    ...n.question
                                }}
                                user={profile}
                                showGroupAndTime={true}
                                inviterHandle={inviterHandle}
                            />
                        )
                    }

                    {user_votes_data?.Votes.length - 1 !== i ? (
                        <hr />
                    ) : null}
                </div>


            ))}

            {user_votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
            {/* <pre style={{ color: "white" }}>
                {JSON.stringify(profile?.stats, null, 2)}
                {JSON.stringify(profile?.yourStats, null, 2)}
            </pre> */}

        </div>
    );
}

