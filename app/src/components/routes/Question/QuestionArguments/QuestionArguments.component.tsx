import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useAuthUser from '@state/AuthUser/authUser.effect';
import { USER } from "@state/User/typeDefs";
import { VOTES } from "@state/Vote/typeDefs";
import Notification from '@shared/Notification';
import SortSmallSvg from "@shared/Icons/Sort-small.svg";
import { QUESTION, QUESTION_VOTERS } from '@state/Question/typeDefs';
import Popper from "@shared/Popper";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import DropAnimation from '@components/shared/DropAnimation';
import ArgumentForm from '@components/shared/Forms/ArgumentForm';

import './style.sass';

export const QuestionArguments: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle, section, subsection, subsubsection } = useParams<any>();

    const [sortBy, setSortBy] = useState('weight');

    const { liquidUser } = useAuthUser();

    return (
        <>

            <ArgumentForm />

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

