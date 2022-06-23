import React, { FunctionComponent, useState } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import { QUESTIONS_CREATED_BY_USER } from "@state/Question/typeDefs";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropAnimation from "@components/shared/DropAnimation";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';

export const ProfilePolls: FunctionComponent<{}> = ({ }) => {

    const { liquidUser } = useAuthUser();

    const [sortBy, setSortBy] = useState('time');

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS_CREATED_BY_USER, {
        variables: {
            handle: liquidUser?.handle || null,
            sortBy,
        }
        // skip: !liquidUser
    });

    console.log({ questions_data });

    return (
        <div className="mt-3">
            {questions_data?.QuestionsCreatedByUser?.map((v: any, i: any) => (
                <div key={'polls-' + i}>

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

                    {v.questionType === 'multi' && (
                        <MultiVoteInList
                            key={`multi-${v.questionText}`}
                            v={v}
                            showGroupAndTime={true}
                        />
                    )}
                    {v.questionType === 'single' && (
                        <SingleVoteInList
                            key={`single-${v.questionText}`}
                            l={v}
                            showGroupAndTime={true}
                            showIntroMessage={true}
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

