import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { USER } from "@state/User/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import SortSmallSvg from "@shared/Icons/Sort-small.svg";
import { ARGUMENTS } from "@state/Argument/typeDefs";
import Popper from "@shared/Popper";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';
import ArgumentForm from '@components/shared/Forms/ArgumentForm';
import ArgumentInList from './ArgumentInList';

import './style.sass';

export const QuestionArguments: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle, section, subsection, subsubsection } = useParams<any>();

    const {
        loading: arguments_loading,
        error: arguments_error,
        data: arguments_data,
        refetch: arguments_refetch
    } = useQuery(ARGUMENTS, {
        variables: {
            questionText: voteName,
            groupHandle
        }
    });

    const [sortBy, setSortBy] = useState('weight');

    const { liquidUser } = useAuthUser();

    console.log({
        arguments_data
    });

    return (
        <>

            {!!liquidUser && (
                <>
                    <ArgumentForm />
                    <hr />
                </>
            )}

            {!arguments_data?.Arguments?.length &&  (
                <p className="py-5 text-center">No one has made any arguments on this poll yet.</p>
            )}

            {arguments_data?.Arguments?.map(a =>
                <ArgumentInList a={a} />
            )}

            {/* <pre>
                {JSON.stringify({
                    type
                }, null, 2)}
            </pre>

            <pre>
                {JSON.stringify(question_voters_data, null, 2)}
            </pre> */}




        </>
    );
}

