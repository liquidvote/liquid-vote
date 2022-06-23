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
                    modalData.InviteType === 'representation' ? `Invite others to be represented by you` :
                        modalData.InviteType === 'toGroup' ? `Invite others to join ${modalData.groupName}` :
                            modalData.InviteType === 'toVote' ? `Invite others to Vote on ${modalData.voteName}` :
                                modalData.InviteType === 'toCompare' ? `Invite others to Compare with ${modalData.userHandle === liquidUser.handle ? 'You' : `${modalData.userName}`}` :
                                ''
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <p className="text-center mt-4 mb-n4">
                    {modalData.InviteType === 'toGroup' && `Share this link with whom you'd like to join ${modalData.groupName}`}
                    {modalData.InviteType === 'toVote' && `Share this link with whom you'd like to vote on ${modalData.voteName}`}
                    {modalData.InviteType === 'toCompare' && `Share this link with whom you'd like to compare with ${modalData.userHandle === liquidUser.handle ? 'yourself' : `${modalData.userName}`}`}
                </p>

                <div className="my-5">
                    <InvitesLink
                        label={'Get Link'}
                        inviteLink={modalData.inviteLink}
                    />
                </div>
                <br />

            </div>
        </form>
    );
}

