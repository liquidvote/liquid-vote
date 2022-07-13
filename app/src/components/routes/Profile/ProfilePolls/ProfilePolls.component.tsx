import React, { FunctionComponent, useState } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { timeAgo } from '@state/TimeAgo';

import { QUESTIONS } from "@state/Question/typeDefs";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropAnimation from "@components/shared/DropAnimation";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';

export const ProfilePolls: FunctionComponent<{ userHandle: string, user: any }> = ({ userHandle, user }) => {

    const { liquidUser } = useAuthUser();

    const [sortBy, setSortBy] = useState('time');

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS, {
        variables: {
            createdByHandle: userHandle,
            sortBy,
        },
        skip: !userHandle
    });

    console.log({ questions_data });

    return (
        <div className="mt-3">
            {questions_data?.Questions?.map((v: any, i: any) => (
                <div key={'polls-' + i}>

                    {v?.group?.handle !== questions_data?.Questions[i - 1]?.group?.handle ? (
                        <div className="poll-cover-container">
                            <div
                                className="poll-cover"
                                style={{
                                    background: v?.group?.cover && `url(${v?.group?.cover}) 50% 50% / cover no-repeat`
                                }}
                            />
                            <div className="poll-cover-overlay">
                            </div>
                            <div className="poll-cover-info">
                                <Link to={`/group/${v?.group?.handle}`}>
                                    <h5 className="white p-0 m-0">
                                        {v?.group?.name}
                                    </h5>
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    <div className="my-2 d-flex align-items-center flex-nowrap justify-content-between">
                        <small
                            className="d-flex justify-content-center align-items-center align-self-end"
                        >
                            {/* <small className="time-ago" data-tip="Last vote was"> */}
                            {!!v?.createdBy && v?.createdBy?.name }
                            {' '}launched{' '}
                            {timeAgo.format(new Date(Number(v?.createdOn)))}
                        </small>
                    </div>

                    {v.questionType === 'multi' && (
                        <MultiVoteInList
                            key={`multi-${v.questionText}`}
                            v={v}
                            showGroupAndTime={true}
                            user={user}
                        />
                    )}
                    {v.questionType === 'single' && (
                        <SingleVoteInList
                            key={`single-${v.questionText}`}
                            l={v}
                            showGroupAndTime={true}
                            user={user}
                        />
                    )}

                    <hr />
                </div>
            ))}

            {questions_data?.UserQuestions?.length === 0 && (
                <div className="p-4 text-center">
                    User hasn't launched any polls yet
                </div>
            )}

            {questions_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
        </div>
    );
}

