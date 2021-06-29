import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import VoteWrapper from "@shared/VoteWrapper";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { QUESTIONS } from "@state/Question/typeDefs";

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
                                v={v}
                                i={i}
                            />
                        )}
                        {v.questionType === 'single' && (
                            <SingleVoteInList
                                l={v}
                                showGroup={true}
                                showIntroMessage={true}
                            />
                        )}
                        <hr />
                    </div>
                ))}

            </>
        );
    }

