import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { QUESTIONS } from "@state/Question/typeDefs";
import DropAnimation from "@components/shared/DropAnimation";

import './style.sass';

export const GroupPolls: FunctionComponent<{
    sortBy: any
}> = ({
    sortBy
}) => {

        let { handle } = useParams<any>();
        const { allSearchParams, updateParams } = useSearchParams();

        const {
            loading: questions_loading,
            error: questions_error,
            data: questions_data,
            refetch: questions_refetch
        } = useQuery(QUESTIONS, {
            variables: {
                group: handle,
                sortBy
            }
        });

        useEffect(() => {
            if (allSearchParams.refetch === 'question') {
                questions_refetch();
                updateParams({ keysToRemove: ['refetch'] })
            }
        }, [allSearchParams.refetch]);

        return (
            <>
                {questions_data?.Questions?.map((q: any, i: any) => (
                    <div key={'polls-' + i}>
                        {q.questionType === 'multi' && (
                            <MultiVoteInList
                                key={`multi-${q.questionText}`}
                                v={q}
                                i={i}
                            />
                        )}
                        {q.questionType === 'single' && (
                            <SingleVoteInList
                                key={`single-${q.questionText}`}
                                l={q}
                                showGroup={true}
                                showIntroMessage={true}
                            />
                        )}
                        <hr />
                    </div>
                ))}

                {questions_data?.Questions?.length === 0 && (
                    <div className="p-4 text-center">
                        There are no polls in this group yet
                    </div>
                )}

                {questions_loading && (
                    <div className="d-flex justify-content-center mt-5">
                        <DropAnimation />
                    </div>
                )}

            </>
        );
    }

