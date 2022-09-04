import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import { QUESTIONS_VOTERS_ALSO_VOTED_ON } from '@state/Question/typeDefs';
import DropAnimation from '@components/shared/DropAnimation';
import GroupPollListCover from "@shared/GroupPollListCover";

import './style.sass';

export const QuestionsVotersAlsoVotedOn: FunctionComponent<{ originalQuestion?: any }> = ({ originalQuestion }) => {

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

    const maxCount = originalQuestion?.questionType === 'single' ?
        originalQuestion?.stats?.forCount + originalQuestion?.stats?.againstCount :
        Math.max(...originalQuestion.choices.map(c => c.stats?.forCount + c.stats?.againstCount));

    return (
        <div className="mt-3">
            {questions_data?.VotersAlsoVotedOn?.map((v: any, i: any) => (
                <>
                    {v?.group?.handle !== questions_data?.VotersAlsoVotedOn[i - 1]?.group?.handle ? (
                        <GroupPollListCover
                            group={v?.group}
                        />
                    ) : null}
                    <div key={'alsoVotedOnpolls-' + i}>


                        <p className="faded small my-2 white">
                            {v?.votersInCommonStats?.voterCount} voters in common
                        </p>

                        {v.questionType === 'multi' && (
                            <MultiVoteInList
                                key={`multi-${v.questionText}`}
                                v={v}
                                showGroupAndTime={true}
                                votersInCommonStats={v?.votersInCommonStats}
                                originalQuestion={originalQuestion}
                                originalQuestionMaxCount={maxCount}
                            />
                        )}
                        {v.questionType === 'single' && (
                            <SingleVoteInList
                                key={`single-${v.questionText}`}
                                l={v}
                                showGroupAndTime={true}
                                votersInCommonStats={v?.votersInCommonStats}
                                originalQuestion={originalQuestion}
                                originalQuestionMaxCount={maxCount}
                            />
                        )}
                        <hr />
                    </div>
                </>
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

