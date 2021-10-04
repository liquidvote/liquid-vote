import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import InvitesInput from '@components/shared/Inputs/InvitesInput';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import useGroup from '@state/Group/group.effect';
import useUser from '@state/User/user.effect';
import DropAnimation from '@components/shared/DropAnimation';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    invitedUsers: any[]
}

export const AcceptInvite: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = allSearchParams.modalData && JSON.parse(allSearchParams.modalData);
    const { loginWithPopup } = useAuth0();
    const [acceptInviteOnLogin, setAcceptInviteOnLogin] = useState(false);

    const { liquidUser } = useAuthUser();
    const { group } = useGroup({ handle: modalData?.groupHandle });
    const { user } = useUser({ userHandle: modalData?.by });

    const isMember = !!liquidUser && group?.yourMemberRelation?.isMember;

    const [editGroupMemberChannelRelation, {
        loading: editGroupMemberChannelRelation_loading,
        error: editGroupMemberChannelRelation_error,
        data: editGroupMemberChannelRelation_data,
    }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

    useEffect(() => {
        if (acceptInviteOnLogin && !!liquidUser) {
            acceptInvite();
        }
    }, [liquidUser]);

    const acceptInvite = () => {
        if (!!liquidUser) {
            if (modalData?.to === 'group') {
                editGroupMemberChannelRelation({
                    variables: {
                        UserHandle: liquidUser?.handle,
                        GroupHandle: modalData?.groupHandle,
                        // InviteId: allSearchParams?.inviteId,
                        IsMember: true
                    }
                }).then(() => {
                    updateParams({
                        keysToRemove: ['modal', 'modalData'],
                        paramsToAdd: { refetch: 'group' }
                    });
                });
            }
        } else {
            setAcceptInviteOnLogin(true);
            loginWithPopup();
        }
    };

    return (
        <div>
            <ModalHeader
                title={
                    modalData?.to === 'representation' ? `TODO` :
                        modalData?.to === 'group' ? (
                            !!group ?
                                `Accept invite to join ${group?.name}` :
                                'Loading Invite'
                        ) :
                            modalData?.to === 'vote' ? `TODO` :
                                ''
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">
                {!!user ? (
                    <div className="d-flex flex-column justify-content-center">
                        <div className="d-flex justify-content-center align-items-center mt-4 mb-2 px-4">
                            <div
                                className="small-avatar bg"
                                style={{
                                    background: user?.avatar && `url(${user.avatar}) 50% 50% / cover no-repeat`
                                }}
                            />
                            <p className="m-0">
                                {user?.name} is inviting you to join {group?.name}
                            </p>
                        </div>

                        {acceptInviteOnLogin ? (
                            <div className="mx-5 my-4 text-center">
                                <img
                                    className="vote-avatar"
                                    src={'http://images.liquid-vote.com/system/loading.gif'}
                                />
                            </div>
                        ) : !isMember ? (
                            <button
                                className="button_ mx-5 my-4"
                                onClick={acceptInvite}
                                disabled={editGroupMemberChannelRelation_loading}
                            >Join Group</button>
                        ) : (
                            <p className="mx-5 my-4 text-center">But you are already a member.</p>
                        )}
                    </div>
                ) : (
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                )}
            </div>
        </div>
    );
}

