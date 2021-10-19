import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import SortSmallSvg from "@shared/Icons/Sort-small.svg";

import { QUESTION, QUESTION_VOTERS } from '@state/Question/typeDefs';
import Popper from "@shared/Popper";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';

import './style.sass';

export const QuestionVotes: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle, section, subsection, subsubsection } = useParams<any>();

    const [sortBy, setSortBy] = useState('weight');

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: voteName,
            group: groupHandle
        }
    });

    const { liquidUser } = useAuthUser();

    const type = (() => {
        if (!subsection || subsection === 'direct' && subsubsection === 'for') {
            return 'directFor';
        } else if (subsection === 'direct' && subsubsection === 'against') {
            return 'directAgainst';
        } else if (subsection === 'represented' && !subsubsection) {
            return 'indirectVotesMade'
        } else if (subsection === 'direct' && subsubsection === 'byYou') {
            return 'directVotesMadeByYou';
        } else if (subsection === 'represented' && subsubsection === 'byyou') {
            return 'indirectVotesMadeByYou';
        } else if (subsection === 'represented' && subsubsection === 'foryou') {
            return 'indirectVotesMadeForYou';
        }

        return null
    })();

    const {
        loading: votes_loading,
        error: votes_error,
        data: votes_data,
        refetch: votes_refetch
    } = useQuery(VOTES, {
        variables: {
            questionText: voteName,
            groupHandle,
            handleType: 'user',
            type,
            sortBy
        },
        skip: !type
    });

    return (
        <>

            <ul className="nav d-flex justify-content-around mt-n3 mx-n3">
                <li className="nav-item">
                    <Link
                        className={`nav-link ${(!subsection || subsection === 'direct') && 'active'}`}
                        to={`/poll/${voteName}/${groupHandle}/timeline`}
                    >
                        <b>{question_data?.Question?.stats?.directVotes}</b> Direct
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        className={`nav-link ${(subsection === 'represented') && 'active'}`}
                        to={`/poll/${voteName}/${groupHandle}/timeline/represented`}
                    >
                        <b>{question_data?.Question?.stats?.indirectVotes}</b> Represented
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>
            <hr className="mt-n4" />

            {
                (!subsection || subsection === 'direct') && (
                    <>
                        <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${(!subsubsection || subsubsection === 'for') && 'active'}`}
                                    to={`/poll/${voteName}/${groupHandle}/timeline/direct/for`}
                                >
                                    <b className="forDirect white px-1 rounded">{question_data?.Question?.stats?.forDirectCount}</b> For
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${(subsubsection === 'against') && 'active'}`}
                                    to={`/poll/${voteName}/${groupHandle}/timeline/direct/against`}
                                >
                                    <b className="againstDirect white px-1 rounded">{question_data?.Question?.stats?.againstDirectCount}</b> Against
                                </Link>
                            </li>
                        </ul>
                        <hr className="mt-n4" />
                    </>
                )
            }

            {!!liquidUser && subsection === 'represented' && (
                <>
                    <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!subsubsection && 'active'}`} to={`/poll/${voteName}/${groupHandle}/timeline/represented`}>
                                <b>{question_data?.Question?.stats?.indirectVotes}</b> By anyone
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'byyou' && 'active'}`} to={`/poll/${voteName}/${groupHandle}/timeline/represented/byyou`}>
                                {/* <b>{profile?.yourStats?.indirectVotesMadeByYou}</b> */}
                                By you
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${subsubsection === 'foryou' && 'active'}`} to={`/poll/${voteName}/${groupHandle}/timeline/represented/foryou`}>
                                {/* <b>{profile?.yourStats?.indirectVotesMadeForYou}</b> */}
                                For you
                            </Link>
                        </li>
                    </ul>
                    <hr className="mt-n4" />
                </>
            )}

            {votes_data?.Votes.length === 0 && (
                <div className="p-4 text-center">
                    {
                        (() => {
                            if (type === 'directFor') {
                                return 'This poll hasn\'t received any votes in favor yet';
                            } else if (type === 'directAgainst') {
                                return 'This poll hasn\'t received any votes against yet';
                            } else if (type === 'indirectVotesMade') {
                                return 'No one has been represented for this poll yet';
                            } else if (type === 'directVotesMadeByYou') {
                                return 'You  haven\'t voted for this poll yet';
                            } else if (type === 'indirectVotesMadeByYou') {
                                return 'You haven\'t represented anyone for this poll yet';
                            } else if (type === 'indirectVotesMadeForYou') {
                                return 'No one has represented you for this poll yet';
                            } 
                            
                            return 'type'
                        })()
                    }{' '}
                </div>
            )}

            {votes_data?.Votes?.map((n, i) => (
                <Notification
                    key={type + i}
                    v={{
                        ...n,
                        user: {
                            ...n.user,
                        }
                    }}
                    showChart={false}
                    hideGroup={true}
                    hideQuestionText={true}
                />
            ))}

            {votes_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            {/* <pre>{JSON.stringify(question_data?.Question?.stats, null, 2)}</pre> */}

        </>
    );
}

