import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { GROUP } from "@state/Group/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from "@components/shared/DropAnimation";

import './style.sass';

export const GroupVotes: FunctionComponent<{ selectedChannels: any }> = ({ selectedChannels }) => {

    let { section, subsection, subsubsection, handle } = useParams<any>();

    const [sortBy, setSortBy] = useState('representing');

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
            return 'indirectVotesMade'
        } else if (subsection === 'direct' && subsubsection === 'byYou') {
            return 'directVotesMadeByYou';
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
        variables: { handle, handleType: 'group', type, sortBy }
    });

    console.log({
        yourStats: group_data?.Group?.yourStats,
        type,
        subsection,
        subsubsection,
        votes_data: votes_data?.Votes.length,
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
                        <b>{group_data?.Group?.stats?.indirectVotesMade}</b> Represented Votes
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
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
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byYou' && 'active'}`} to={`/group/${handle}/votes/direct/byYou`}>
                                <b>{group_data?.Group?.yourStats?.directVotesMade}</b> by You
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
                                <b>{group_data?.Group?.stats?.indirectVotesMade}</b> All
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
                    {/* {group_data.Group?.name}{' '} */}
                    {
                        (() => {
                            if (type === 'directVotesMade') {
                                return 'no one answered directly to any direct polls';
                            } else if (type === 'directVotesInAgreement') {
                                return 'no one agreed with you on any polls';
                            } else if (type === 'directVotesInDisagreement') {
                                return 'no one disagreed with you on any polls';
                            } else if (type === 'indirectVotesMade') {
                                return 'no one has been represented on any polls'
                            } else if (type === 'indirectVotesMadeByYou') {
                                return 'no one has been represented by you on any polls';
                            } else if (type === 'indirectVotesMadeForYou') {
                                return 'no one has represented you on any polls';
                            } else if (type === 'directVotesMadeByYou') {
                                return 'you haven\'t made any votes';
                            }
                            return 'MISSING TYPE'
                        })()
                    }{' '}
                    in this group ({group_data.Group?.name}) yet
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
                <>
                    {i}
                    <Notification
                        key={'notification-groupvote' + type + n.questionText + n.choiceText + n.user.name + i}
                        v={{
                            ...n
                        }}
                        showChart={true}
                    />
                </>
            ))}

            {votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            {/* <br />
            <br />
            <pre style={{ color: "white" }}>
                {JSON.stringify(group_data?.Group?.stats, null, 2)}
                {JSON.stringify(group_data?.Group?.yourStats, null, 2)}
            </pre> */}
        </>
    );
}

