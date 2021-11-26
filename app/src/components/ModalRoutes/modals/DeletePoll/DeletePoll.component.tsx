import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import {
    EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION
} from "@state/User/typeDefs";
import useGroup from '@state/Group/group.effect';
import useUser from '@state/User/user.effect';
import DropAnimation from '@components/shared/DropAnimation';
import useUserRepresentedBy from "@state/User/userRepresentedBy.effect";
import ChooseRepresentatives from '@components/shared/ChooseRepresentatives';
import { QUESTION, EDIT_QUESTION } from "@state/Question/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    invitedUsers: any[]
}

export const DeletePoll: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = allSearchParams.modalData && JSON.parse(allSearchParams.modalData);
    const { liquidUser } = useAuthUser();

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: modalData.questionText,
            group: modalData.group,
            // channel: modalData.channelHandle
        },
        skip: modalData.questionText === "new"
    });

    const [editQuestion, {
        loading: editQuestion_loading,
        error: editQuestion_error,
        data: editQuestion_data,
    }] = useMutation(EDIT_QUESTION);

    return (
        <form>
            <ModalHeader
                title="Delete Poll?"
                hideSubmitButton={true}
            />

            <div className="Modal-Content">
                <p className="my-3 mx-5">
                    This can’t be undone. <br/>
                    <i className="white">"{modalData.questionText}?"</i>{' '}
                    will become unavailable to everyone.
                </p>
                <div className="d-flex flex-column align-items-center my-3 mb-5 mx-5">
                    <div
                        className="button_ inverted text-danger mb-2 w-100"
                        onClick={
                            () => editQuestion({
                                variables: {
                                    questionText: modalData.questionText,
                                    group: modalData.group,
                                    Question: {
                                        ...question_data.Question,
                                        status: 'deleted'
                                    }
                                }
                            })
                        }
                    >
                        Delete
                    </div>
                    <div
                        className="button_ w-100"
                        onClick={() => updateParams({ keysToRemove: ['modal', 'modalData'] })}
                    >
                        Cancel
                    </div>
                </div>
            </div>
        </form>
    );
}

