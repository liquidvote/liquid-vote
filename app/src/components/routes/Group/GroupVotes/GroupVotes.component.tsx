import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import useGroup from '@state/Group/group.effect';
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import DropAnimation from "@components/shared/DropAnimation";

import './style.sass';

export const GroupVotes: FunctionComponent<{ sortBy: any }> = ({ sortBy }) => {

    let { section, subsection, subsubsection, handle } = useParams<any>();

    const { liquidUser } = useAuthUser();

    const { group } = useGroup({ handle });

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
        variables: { groupHandle: handle, type, sortBy }
    });

    return (
        <>

            <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!subsection || subsection === 'direct') && 'active'}`} to={`/group/${handle}/votes/direct`}>
                        <b>{group?.stats?.directVotesMade}</b> Direct
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${subsection === 'represented' && 'active'}`} to={`/group/${handle}/votes/represented`}>
                        <b>{group?.stats?.indirectVotesMade}</b> Represented
                    </Link>
                </li>
            </ul>
            <hr className="mt-n4" />

            {!!liquidUser && group?.handle !== liquidUser.handle && (!subsection || subsection === 'direct') && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/group/${handle}/votes/direct`}>
                                <b>{group?.stats?.directVotesMade}</b> All
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'same' && 'active'}`} to={`/group/${handle}/votes/direct/same`}>
                                <b className="white forDirect px-1 rounded" >{group?.yourStats?.directVotesInAgreement}</b> Same
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'different' && 'active'}`} to={`/group/${handle}/votes/direct/different`}>
                                <b className="white againstDirect px-1 rounded" >{group?.yourStats?.directVotesInDisagreement}</b> Different
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byYou' && 'active'}`} to={`/group/${handle}/votes/direct/byYou`}>
                                <b>{group?.yourStats?.directVotesMade}</b> by You
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {!!liquidUser && group?.handle !== liquidUser.handle && subsection === 'represented' && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/group/${handle}/votes/represented`}>
                                <b>{group?.stats?.indirectVotesMade}</b> By anyone
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byyou' && 'active'}`} to={`/group/${handle}/votes/represented/byyou`}>
                                <b>{group?.yourStats?.indirectVotesMadeByYou}</b> By you
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'foryou' && 'active'}`} to={`/group/${handle}/votes/represented/foryou`}>
                                <b>{group?.yourStats?.indirectVotesMadeForYou}</b> For you
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
                    in this group ({group?.name}) yet
                </div>
            )}

            {votes_data?.Votes.map((n, i) => (
                <Notification
                    key={'notification-groupvote' + type + n.questionText + n.choiceText + n.user.name + i}
                    v={{
                        ...n
                    }}
                    showChart={true}
                />
            ))}

            {votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
        </>
    );
}

