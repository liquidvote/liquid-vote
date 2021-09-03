import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { QUESTIONS } from "@state/Question/typeDefs";
import { GROUP } from "@state/Group/typeDefs";
import DropAnimation from "@components/shared/DropAnimation";

import './style.sass';

export const GroupPolls: FunctionComponent<{
    selectedChannels: any
}> = ({
    selectedChannels
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
                channels: selectedChannels
            }
        });

        const {
            loading: group_loading,
            error: group_error,
            data: group_data,
            refetch: group_refetch
        } = useQuery(GROUP, {
            variables: { handle }
        });

        console.log({ questions_data });

        useEffect(() => {
            if (allSearchParams.refetch === 'question') {
                questions_refetch();
                updateParams({ keysToRemove: ['refetch'] })
            }
        }, [allSearchParams.refetch]);

        return (
            <>
                {questions_data?.Questions?.map((v: any, i: any) => (
                    <div key={'polls-' + i}>
                        {v.questionType === 'multi' && (
                            <MultiVoteInList
                                key={`multi-${v.questionText}`}
                                v={v}
                                i={i}
                            />
                        )}
                        {v.questionType === 'single' && (
                            <SingleVoteInList
                                key={`single-${v.questionText}`}
                                l={v}
                                showGroup={true}
                                showIntroMessage={true}
                            />
                        )}
                        <hr />
                    </div>
                ))}

                {questions_loading && (
                    <div className="d-flex justify-content-center mt-5">
                        <DropAnimation />
                    </div>
                )}

            </>
        );
    }

