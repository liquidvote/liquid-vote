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

    useEffect(() => {
        setValue('invitedUsers', []);
    }, [modalData?.InviteType]);

    return (
        <form>
            <ModalHeader
                title={
                    modalData.InviteType === 'representation' ? `Invite to be represented by you` :
                        modalData.InviteType === 'toGroup' ? `Invite vote with you on ${modalData.groupName}` :
                            modalData.InviteType === 'toVote' ? `Invite to Vote on ${modalData.voteName}` :
                                modalData.InviteType === 'toCompare' ? `Invite to Compare with ${modalData.userHandle === liquidUser.handle ? 'You' : `${modalData.userName}`}` :
                                    ''
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                {!navigator.canShare ? (
                    <>
                        <p className="text-center mt-4 mb-n4">
                            {modalData.InviteType === 'toGroup' && `Share this link with whom you'd like to vote with you on ${modalData.groupName}`}
                            {modalData.InviteType === 'toVote' && `Share this link with whom you'd like to vote on ${modalData.voteName}`}
                            {modalData.InviteType === 'toCompare' && `Share this link with whom you'd like to compare with ${modalData.userHandle === liquidUser.handle ? 'yourself' : `${modalData.userName}`}`}
                        </p>

                        <div className="my-5">
                            <InvitesLink
                                label={'Get Link'}
                                inviteLink={modalData.inviteLink}
                            />
                        </div>
                    </>
                ) : (
                    <div className='d-flex justify-content-center mt-4'>
                        <button
                            className="button_"
                            onClick={() => navigator.share({
                                title: modalData?.title,
                                text: modalData?.text,
                                url: modalData?.inviteLink
                            })}
                        >{modalData?.buttonText}</button>
                    </div>
                )}
                <br />

                <hr className="mt-0 pt-3 mb-4 mx-1" />

                <p className="text-center mb-4">
                    <b>Or invite your followers</b>
                </p>

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
                </div>

            </div>
        </form>
    );
}

