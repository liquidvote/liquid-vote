import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { USER } from "@state/User/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";

import Popper from "@shared/Popper";
import SortSmallSvg from "@shared/Icons/Sort-small.svg";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import { timeAgo } from '@state/TimeAgo';
import GroupPollListCover from "@shared/GroupPollListCover";

import './style.sass';

export const ProfileVotes: FunctionComponent<{}> = ({ }) => {

    let { section, subsection, subsubsection, handle, groupHandle, inviterHandle } = useParams<any>();

    const [sortBy, setSortBy] = useState('time');

    const { liquidUser } = useAuthUser();

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
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
            userHandle: handle,
            ...groupHandle && { groupHandle },
            type,
            sortBy
        },
        // fetchPolicy: "no-cache"
    });

    // console.log({
    //     user_votes_data
    // });

    return (
        <>
            {/* <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!subsection || subsection === 'direct') && 'active'}`} to={`/profile/${handle}/votes/direct`}>
                        <b>{profile?.stats?.directVotesMade}</b> Direct Votes
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${subsection === 'represented' && 'active'}`} to={`/profile/${handle}/votes/represented`}>
                        <b>{profile?.stats?.indirectVotesMadeForUser}</b> Represented
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>
            <hr className="mt-n4" /> */}

            {/* {!!liquidUser && profile.handle !== liquidUser.handle && (!subsection || subsection === 'direct') && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/profile/${handle}/votes/direct`}>
                                <b>{profile?.stats?.directVotesMade}</b> All
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'same' && 'active'}`} to={`/profile/${handle}/votes/direct/same`}>
                                <b className="white forDirect px-1 rounded" >{profile?.yourStats?.directVotesInAgreement}</b> Same as you
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

            {!!liquidUser && profile.handle !== liquidUser.handle && subsection === 'represented' && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/profile/${handle}/votes/represented`}>
                                <b>{profile?.stats?.indirectVotesMadeForUser}</b> By anyone
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
            )} */}


            {!!liquidUser && profile.handle !== liquidUser.handle && (subsubsection === 'same' || subsubsection === 'different') && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n3 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'same' && 'active'}`} to={`/profile/${handle}/votes/direct/same`}>
                                <b className="white forDirect px-1 rounded" >{profile?.yourStats?.directVotesInAgreement}</b> Same as you
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



            {user_votes_data?.Votes.length === 0 && (
                <div className="p-4 text-center">
                    {profile?.name}{' '}
                    {
                        (() => {
                            if (type === 'directVotesMade') {
                                return 'hasn\'t answered any polls';
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
                    you can see, yet
                </div>
            )}

            {user_votes_data?.Votes
                // remove repeated
                .filter((v, i, a) => a.findIndex(v2 => (v2.question.questionText === v.question.questionText)) === i)
                .map((v, i) => (
                    <>
                        {v?.question?.group?.handle !== user_votes_data?.Votes[i - 1]?.question?.group?.handle ? (
                            <GroupPollListCover
                                group={v?.question?.group}
                                user={profile}
                            />
                        ) : null}
                        <div key={'feed-poll-' + v?.question?.group?.handle + '-' + v?.question?.questionText}>
                            <div className='d-flex align-items-center mt-3 mb-1'>

                                <small className='ml-0 faded'>
                                    {profile?.name}
                                    {' '}
                                    voted
                                    {' '}
                                    {timeAgo.format(new Date(Number(v?.lastEditOn)))}
                                </small>
                            </div>

                            {v?.question?.questionType === 'multi' && (
                                <MultiVoteInList
                                    key={`multi-${v?.question?.questionText}`}
                                    v={v?.question}
                                    showGroupAndTime={true}
                                    user={profile}
                                    inviterHandle={inviterHandle}
                                />
                            )}
                            {v?.question?.questionType === 'single' && (
                                <SingleVoteInList
                                    key={`single-${v?.question?.questionText}`}
                                    l={v?.question}
                                    showGroupAndTime={true}
                                    user={profile}
                                    inviterHandle={inviterHandle}
                                />
                            )}
                            <hr />
                        </div>
                    </>
                ))
            }

            {
                user_votes_loading && (
                    <div className="d-flex justify-content-center mt-5">
                        <DropAnimation />
                    </div>
                )
            }

            <br />
            <br />
            {/* <pre style={{ color: "white" }}>
                {JSON.stringify(profile?.stats, null, 2)}
                {JSON.stringify(profile?.yourStats, null, 2)}
            </pre> */}

        </>
    );
}

