import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { USER, USER_VOTES } from "@state/User/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import { VoteTimeline } from "@state/Mock/Notifications";
import Popper from "@shared/Popper";
import SortSmallSvg from "@shared/Icons/Sort-small.svg";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';

import './style.sass';

export const ProfileVotes: FunctionComponent<{}> = ({ }) => {

    let { section, subsection, subsubsection, handle } = useParams<any>();

    const [sortBy, setSortBy] = useState('weight');

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authLiquidUser = authUser_data?.authUser?.LiquidUser;

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const profile = user_data?.User;

    console.log({
        authLiquidUser,
        profile
    })

    const type = (() => {
        if ((!subsection || subsection === 'direct') && !subsubsection) {
            return 'directVotesMade';
        } else if (subsubsection === 'same') {
            return 'directVotesInAgreement';
        } else if (subsubsection === 'different') {
            return 'directVotesInDisagreement';
        } else if (subsection === 'represented' && !subsubsection) {
            return 'indirectVotes'
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
        variables: { handle, handleType: 'user', type, sortBy }
    });

    return (
        <>
            <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!subsection || subsection === 'direct') && 'active'}`} to={`/profile/${handle}/votes/direct`}>
                        <b>{profile?.stats?.directVotesMade}</b> Direct Votes
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${subsection === 'represented' && 'active'}`} to={`/profile/${handle}/votes/represented`}>
                        <b>{profile?.stats?.indirectVotesMadeForUser}</b> Represented Votes
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>
            <hr className="mt-n4" />

            {!!authLiquidUser && profile.handle !== authLiquidUser.handle && (!subsection || subsection === 'direct') && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/profile/${handle}/votes/direct`}>
                                <b>{profile?.stats?.directVotesMade}</b> All
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'same' && 'active'}`} to={`/profile/${handle}/votes/direct/same`}>
                                <b className="white forDirect px-1 rounded" >{profile?.yourStats?.directVotesInAgreement}</b> Same
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'different' && 'active'}`} to={`/profile/${handle}/votes/direct/different`}>
                                <b className="white againstDirect px-1 rounded" >{profile?.yourStats?.directVotesInDisagreement}</b> Different
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {!!authLiquidUser && profile.handle !== authLiquidUser.handle && subsection === 'represented' && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/profile/${handle}/votes/represented`}>
                                <b>{profile?.stats?.indirectVotesMadeByUser}</b> By anyone
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byyou' && 'active'}`} to={`/profile/${handle}/votes/represented/byyou`}>
                                <b>{profile?.yourStats?.indirectVotesMadeByYou}</b> By you
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'foryou' && 'active'}`} to={`/profile/${handle}/votes/represented/foryou`}>
                                <b>{profile?.yourStats?.indirectVotesMadeForYou}</b> For you
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {user_votes_data?.Votes.length === 0 && (
                <div className="p-4 text-center">
                    {user_data?.User?.name}{' '}
                    {
                        (() => {
                            if (type === 'directVotesMade') {
                                return 'hasn\'t answered directly to any direct polls';
                            } else if (type === 'directVotesInAgreement') {
                                return 'hasn\'t agreed with you on any polls';
                            } else if (type === 'directVotesInDisagreement') {
                                return 'hasn\'t disagreed with you on any polls';
                            } else if (type === 'indirectVotes') {
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

            {user_votes_data?.Votes.map((n, i) => (
                <>
                    {i}
                    <Notification
                        key={'notification-uservote' + n.questionText + type + n.choiceText}
                        v={{
                            ...n,
                            // user: profile
                        }}
                        showChart={true}
                    />
                </>
            ))}

            {user_votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            <br />
            <br />
            <pre style={{ color: "white" }}>
                {JSON.stringify(profile?.stats, null, 2)}
                {JSON.stringify(profile?.yourStats, null, 2)}
            </pre>

        </>
    );
}

