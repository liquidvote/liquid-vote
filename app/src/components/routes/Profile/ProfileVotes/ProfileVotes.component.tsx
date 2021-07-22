import React, { FunctionComponent, useMemo } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { USER, USER_VOTES } from "@state/User/typeDefs";
import Notification from '@shared/Notification';
import { VoteTimeline } from "@state/Mock/Notifications";

import './style.sass';

export const ProfileVotes: FunctionComponent<{}> = ({ }) => {

    let { section, subsection, subsubsection, handle } = useParams<any>();

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
    } = useQuery(USER_VOTES, {
        variables: { handle, type }
    });

    console.log({
        type,
        user_votes_data
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
                                <b>{profile?.stats?.indirectVotesMadeForUser}</b> By others
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

            {user_votes_data?.UserVotes.length === 0 && (
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

            {user_votes_data?.UserVotes.map((n, i) => (
                <Notification key={'a'+i} v={{
                    ...n,
                    user: profile,
                    // who: {
                    //     name: "Dan Price",
                    //     avatarClass: 1,
                    //     representing: 12000,
                    //     representsYou: true,
                    // }
                }} showChart={true} />
            ))}
        </>
    );
}

