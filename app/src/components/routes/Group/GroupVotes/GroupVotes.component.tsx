import React, { FunctionComponent, useMemo } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { GROUP } from "@state/Group/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import { VoteTimeline } from "@state/Mock/Notifications";

import './style.sass';

export const GroupVotes: FunctionComponent<{ selectedChannels: any }> = ({ selectedChannels }) => {

    let { section, subsection, subsubsection, handle } = useParams<any>();

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authLiquidUser = authUser_data?.authUser?.LiquidUser;

    const {
        loading: group_loading,
        error: group_error,
        data: group_data,
        refetch: group_refetch
    } = useQuery(GROUP, {
        variables: { handle }
    });

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
        loading: votes_loading,
        error: votes_error,
        data: votes_data,
        refetch: votes_refetch
    } = useQuery(VOTES, {
        variables: { handle, handleType: 'group', type }
    });

    console.log({
        yourStats: group_data?.Group?.yourStats,
        type,
        subsection,
        subsubsection
    });

    return (
        <>

            <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!subsection || subsection === 'direct') && 'active'}`} to={`/group/${handle}/votes/direct`}>
                        <b>{group_data.Group?.stats?.directVotesMade}</b> Direct Votes
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${subsection === 'represented' && 'active'}`} to={`/group/${handle}/votes/represented`}>
                        <b>{group_data?.Group?.yourStats?.indirectVotesMadeForYou}</b> Represented Votes
                    </Link>
                </li>
            </ul>
            <hr className="mt-n4" />

            {!!authLiquidUser && group_data?.Group?.handle !== authLiquidUser.handle && (!subsection || subsection === 'direct') && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/group/${handle}/votes/direct`}>
                                <b>{group_data?.Group?.stats?.directVotesMade}</b> All
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'same' && 'active'}`} to={`/group/${handle}/votes/direct/same`}>
                                <b className="white forDirect px-1 rounded" >{group_data?.Group?.yourStats?.directVotesInAgreement}</b> Same
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'different' && 'active'}`} to={`/group/${handle}/votes/direct/different`}>
                                <b className="white againstDirect px-1 rounded" >{group_data?.Group?.yourStats?.directVotesInDisagreement}</b> Different
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {!!authLiquidUser && group_data?.Group?.handle !== authLiquidUser.handle && subsection === 'represented' && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/group/${handle}/votes/represented`}>
                                <b>{group_data?.Group?.stats?.indirectVotesMadeForUser}</b> By others
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byyou' && 'active'}`} to={`/group/${handle}/votes/represented/byyou`}>
                                <b>{group_data?.Group?.yourStats?.indirectVotesMadeByYou}</b> By you
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'foryou' && 'active'}`} to={`/group/${handle}/votes/represented/foryou`}>
                                <b>{group_data?.Group?.yourStats?.indirectVotesMadeForYou}</b> For you
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {votes_data?.Votes.length === 0 && (
                <div className="p-4 text-center">
                    {group_data.Group?.name}{' '}
                    {
                        (() => {
                            if (type === 'directVotesMade') {
                                return 'hasn\'t answered directly to any direct polls';
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

            {/* <pre>{JSON.stringify(user_votes_data, null, 2)}</pre> */}

            {/* <small>
                Voted the same as you in
                    {' '}<b className="white forDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                {' '}polls and different in
                    {' '}<b className="white againstDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
            </small> */}

            {votes_data?.Votes.map((n, i) => (
                // <pre>{JSON.stringify(n, null, 2)}</pre>
                <Notification
                    key={'notification-groupvote' + type + n.questionText + n.choiceText + n.user.name + i}
                    v={{
                        ...n,
                        // user: profile,
                        // who: {
                        //     name: "Dan Price",
                        //     avatarClass: 1,
                        //     representing: 12000,
                        //     representsYou: true,
                        // }
                    }}
                    showChart={true}
                />
            ))}
        </>
    );
}

