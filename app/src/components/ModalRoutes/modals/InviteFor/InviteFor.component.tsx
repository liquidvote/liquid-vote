import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import InvitesInput from '@components/shared/Inputs/InvitesInput';
import InvitesLink from '@components/shared/Inputs/InvitesLink'

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    invitedUsers: any[],
    groups: any[]
}

export const InviteFor: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const { liquidUser } = useAuthUser();

    const {
        handleSubmit, register, formState: { errors }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange',
        defaultValues: {
            invitedUsers: []
        }
    });
    const onSubmit = (values: any) => {
        console.log(values);

        // editGroup({ variables: { Group: values, handle: modalData.groupHandle } });
    }

    useEffect(() => {
        setValue('invitedUsers', []);
    }, [modalData?.InviteType]);

    // useEffect(() => {
    //     if (editUser_data) {
    //         updateParams({
    //             keysToRemove: ['modal', 'modalData'],
    //             paramsToAdd: { refetch: 'user' }
    //         });
    //     }
    // }, [editUser_data])

    return (
        <form>
            <ModalHeader
                title={
                    modalData.InviteType === 'representation' ? `Invite others to be represented by you` :
                        modalData.InviteType === 'toGroup' ? `Invite others to join ${modalData.groupName}` :
                            modalData.InviteType === 'toVote' ? `Invite others to Vote on ${modalData.questionText}` :
                                ''
                }
                // submitText={`Invite`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <p className="text-center mt-4 mb-n4">
                    {modalData.InviteType === 'toGroup' && `Share this link with whom you'd like to join ${modalData.groupName}`}
                </p>

                <div className="my-5">
                    <InvitesLink
                        label={'Get Link'}

                        // groupName={modalData.groupName}
                        groupHandle={modalData.groupHandle}
                        // fromWhomAvatar={liquidUser?.avatar}
                        // fromWhomName={liquidUser?.name}
                        fromWhomHandle={liquidUser?.handle}

                        // userHandle={modalData.userHandle}
                        // questionText={modalData.questionText}
                    />
                </div>

                {/* <hr className="mt-0 pt-3 mb-5" />

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <InvitesInput
                            name={name}
                            label={'E-Mail Invites'}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                            setValue={setValue}
                            groupHandle={modalData.groupHandle}
                            userHandle={modalData.userHandle}
                            questionText={modalData.questionText}
                        />
                    ))('invitedUsers')}
                </div> */}

                {/* <hr /> */}

                {/* <br /> */}
                <br />

            </div>
        </form>
    );
}

