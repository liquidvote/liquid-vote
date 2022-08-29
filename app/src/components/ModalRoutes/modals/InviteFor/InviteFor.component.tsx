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
                        modalData.InviteType === 'toGroup' ? `Invite to vote with you on ${modalData.groupName}` :
                            modalData.InviteType === 'toVote' ? `Invite to Vote on ${modalData.voteName}` :
                                modalData.InviteType === 'toCompare' ? `Invite to Compare with ${modalData.userHandle === liquidUser.handle ? 'You' : `${modalData.userName}`}` :
                                    ''
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                {!navigator.canShare ? (
                    <>
                        <p className="mt-4 mb-n4">
                            <b>
                                Share invite link
                            </b>
                        </p>

                        <div className="mt-5 mb-1">
                            <InvitesLink
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
                {/* <br /> */}

                {/* <hr className="mt-0 mb-5 mx-1" /> */}

                <p className="mt-4 mb-4">
                    <b>Or invite your followers</b>
                </p>

                <div className="my-3 mb-5">
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
                            type={
                                modalData.InviteType === 'representation' ? `` :
                                    modalData.InviteType === 'toGroup' ? `invited_you_to_vote_on_group` :
                                        modalData.InviteType === 'toVote' ? `invited_you_to_vote_on_a_poll` :
                                            modalData.InviteType === 'toCompare' ? `invited_you_to_vote_on_profile` :
                                                ''}
                            groupHandle={modalData.groupHandle}
                            userHandle={modalData.userHandle}
                            questionText={modalData.voteName}
                        />
                    ))('invitedUsers')}
                </div>

            </div>
        </form>
    );
}

