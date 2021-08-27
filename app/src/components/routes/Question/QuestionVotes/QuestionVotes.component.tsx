import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { USER, USER_VOTES } from "@state/User/typeDefs";
import Notification from '@shared/Notification';
import SortSmallSvg from "@shared/Icons/Sort-small.svg";

import { QUESTION, QUESTION_VOTERS } from '@state/Question/typeDefs';
import Popper from "@shared/Popper";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';

import './style.sass';

export const QuestionVotes: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle, section, subsection, subsubsection } = useParams<any>();

    // const {
    //     loading: authUser_loading,
    //     error: authUser_error,
    //     data: authUser_data,
    //     refetch: authUser_refetch
    // } = useQuery(AUTH_USER);

    // const authLiquidUser = authUser_data?.authUser?.LiquidUser;

    const [sortBy, setSortBy] = useState('weight');


    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: voteName,
            group: groupHandle,
            // channel: groupChannel_.channel
        }
    });

    const type = (() => {
        if (!subsection || subsection === 'direct' && subsubsection === 'for') {
            return 'directFor';
        } else if (subsection === 'direct' && subsubsection === 'against') {
            return 'directAgainst';
        } else if (subsection === 'representingYou') {
            return 'representingYou';
        } else if (subsection === 'representedByYou') {
            return 'representedByYou'
        }
        return null
    })();

    const {
        loading: question_voters_loading,
        error: question_voters_error,
        data: question_voters_data,
        refetch: question_voters_refetch
    } = useQuery(QUESTION_VOTERS, {
        variables: {
            questionText: voteName,
            group: groupHandle,
            // channel: groupChannel_.channel,
            typeOfVoter: type,
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
                        <b>
                            {
                                question_data?.Question?.stats?.forDirectCount +
                                question_data?.Question?.stats?.againstDirectCount
                            }
                        </b> Direct Votes
                    </Link>
                </li>
                {
                    question_data?.Question?.userVote?.position === 'delegated' && (
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${(subsection === 'representingYou') && 'active'}`}
                                to={`/poll/${voteName}/${groupHandle}/timeline/representingYou`}
                            >
                                <b>{question_data?.Question?.userVote?.representatives.length}</b> Representing you
                            </Link>
                        </li>
                    )
                }
                {
                    question_data?.Question?.userVote?.position !== 'delegated' && (
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${(subsection === 'representedByYou') && 'active'}`}
                                to={`/poll/${voteName}/${groupHandle}/timeline/representedByYou`}
                            >
                                <b>{question_data?.Question?.userVote?.representeeVotes?.length}</b> Represented by you
                            </Link>
                        </li>
                    )
                }
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
                                    <b>{question_data?.Question?.stats?.forDirectCount}</b> For
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${(subsubsection === 'against') && 'active'}`}
                                    to={`/poll/${voteName}/${groupHandle}/timeline/direct/against`}
                                >
                                    <b>{question_data?.Question?.stats?.againstDirectCount}</b> Against
                                </Link>
                            </li>
                        </ul>
                        <hr className="mt-n4" />
                    </>
                )
            }

            {/* <pre>
                {JSON.stringify({
                    type
                }, null, 2)}
            </pre>

            <pre>
                {JSON.stringify(question_voters_data, null, 2)}
            </pre> */}


            {question_voters_data?.QuestionVoters.length === 0 && (
                <div className="p-4 text-center">
                    {
                        (() => {
                            if (type === 'directFor') {
                                return 'This poll hasn\'t received any votes in favor yet';
                            } else if (type === 'directAgainst') {
                                return 'This poll hasn\'t received any votes in against yet';
                            } else if (type === 'representingYou') {
                                return 'None of your [🧪] representatives has voted yet';
                            } else if (type === 'representedByYou') {
                                if (!!question_data?.Question?.userVote) {
                                    return 'You aren\'t representing anyone yet';
                                } else {
                                    return 'You haven\'t voted yet, once you do, you\'ll be representing [🧪] group members';
                                }
                            }
                            return 'type'
                        })()
                    }{' '}
                </div>
            )}

            {question_voters_data?.QuestionVoters?.map((n, i) => (
                <Notification
                    key={type + i}
                    v={{
                        ...n,
                        user: {
                            ...n.user,
                        }
                    }}
                    showChart={false}
                />
            ))}

            {question_voters_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

        </>
    );
}

