import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, EDIT_USER } from "@state/User/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const RegisterBefore: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);
    const { loginWithPopup } = useAuth0();

    const { liquidUser } = useAuthUser();

    useEffect(() => {
        if (!!liquidUser) {
            updateParams({
                keysToRemove: ['modal', 'modalData']
            });
        }
    }, [liquidUser]);

    return (
        <form>

            <ModalHeader
                title={
                    `Please Sign Up`
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <div className="d-flex justify-content-center align-items-center mt-4 mb-2 px-4">
                    <p className="m-0">
                        {modalData?.toWhat === 'joinGroup' ? `Please Signup before joining ${modalData?.groupName}` :
                            modalData?.toWhat === 'vote' ? `Please Signup before voting on  ${modalData?.questionText}` :
                                modalData?.toWhat === 'delegating' ? `Please Signup before delegating votes to ${modalData?.userName}` :
                                    modalData?.toWhat === 'upVoteArgument'? `Please Signup before liking an argument` :
                        ''}
                    </p>
                </div>

                <div
                    className="button_ mx-5 my-5"
                    onClick={loginWithPopup}
                >
                    Sign Up
                </div>

            </div>
        </form>
    );
}

