import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import SortSmallSvg from "@shared/Icons/Sort-small.svg";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import { QUESTIONS_VOTERS_ALSO_VOTED_ON } from '@state/Question/typeDefs';
import Popper from "@shared/Popper";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';

import './style.sass';

export const QuestionsVotersAlsoVotedOn: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle, section, subsection, subsubsection } = useParams<any>();

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS_VOTERS_ALSO_VOTED_ON, {
        variables: {
            questionText: voteName,
            group: groupHandle
        }
    });

    console.log({
        questions_data
    });

    return (
        <div className="mt-3">
            {questions_data?.VotersAlsoVotedOn?.map((v: any, i: any) => (
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

                    <p className="faded small my-2 white">
                        {v?.votersInCommonStats?.voterCount} voters in common
                    </p>

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

            {questions_data?.VotersAlsoVotedOn?.length === 0 && (
                <div className="p-4 text-center">
                    None yet
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

