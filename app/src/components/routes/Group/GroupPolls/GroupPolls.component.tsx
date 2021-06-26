import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import VoteWrapper from "@shared/VoteWrapper";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { GROUP_QUESTIONS } from "@state/Group/typeDefs";

import './style.sass';

export const GroupPolls: FunctionComponent<{
    selectedChannels: any
}> = ({
    selectedChannels
}) => {

        let { handle } = useParams<any>();
        const { allSearchParams, updateParams } = useSearchParams();

        const {
            loading: groupQuestions_loading,
            error: groupQuestions_error,
            data: groupQuestions_data,
            refetch: groupQuestions_refetch
        } = useQuery(GROUP_QUESTIONS, {
            variables: {
                handle,
                selectedChannels
            }
        });

        // console.log({ groupQuestions_data });

        useEffect(() => {
            if (allSearchParams.refetch === 'question') {
                groupQuestions_refetch();
                updateParams({ keysToRemove: ['refetch'] })
            }
        }, [allSearchParams.refetch]);

        return (
            <>

                {groupQuestions_data?.GroupQuestions?.map((v: any, i: any) => (
                    <div key={'polls-' + i}>
                        {v.questionType === 'multi' && (
                            <MultiVoteInList
                                v={v}
                                i={i}
                            />
                        )}
                        {v.questionType === 'single' && (
                            <VoteWrapper
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

