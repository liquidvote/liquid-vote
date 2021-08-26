import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import InvitesInput from '@components/shared/Inputs/InvitesInput';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    invitedUsers: any[]
}

export const AcceptInvite: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = allSearchParams.modalData && JSON.parse(allSearchParams.modalData);
    const { user, loginWithPopup } = useAuth0();
    const [acceptInviteOnLogin, setAcceptInviteOnLogin] = useState(false);

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authUser = authUser_data?.authUser;

    const [editGroupMemberChannelRelation, {
        loading: editGroupMemberChannelRelation_loading,
        error: editGroupMemberChannelRelation_error,
        data: editGroupMemberChannelRelation_data,
    }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

    console.log({
        modalData,
        user,
        InviteId: allSearchParams?.inviteId
    });

    useEffect(() => {
        if (acceptInviteOnLogin) {
            acceptInvite();
        }
    }, [authUser]);

    const acceptInvite = () => {
        if (modalData?.toWhat === 'group') {
            console.log({
                InviteId: allSearchParams?.inviteId
            });
            editGroupMemberChannelRelation({
                variables: {
                    UserHandle: authUser?.LiquidUser.handle,
                    GroupHandle: modalData?.groupHandle,
                    InviteId: allSearchParams?.inviteId,
                    IsMember: true
                }
            });
            updateParams({
                keysToRemove: ['modal', 'modalData'],
                paramsToAdd: { refetch: 'group' }
            });
        }
    };

    return (
        <form>
            <ModalHeader
                title={
                    modalData?.toWhat === 'representation' ? `TODO` :
                        modalData?.toWhat === 'group' ? `Accept invite to join ${modalData?.groupName}` :
                            modalData?.toWhat === 'vote' ? `TODO` :
                                ''
                }
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <div className="d-flex flex-column justify-content-center">
                    <div className="d-flex justify-content-center align-items-center mt-4 mb-2 px-4">
                        <div
                            className="small-avatar bg"
                            style={{
                                background: modalData?.fromWhomAvatar && `url(${modalData?.fromWhomAvatar}) no-repeat`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <p className="m-0">
                            {modalData?.fromWhomName} is inviting you to join {modalData?.groupName}
                        </p>
                    </div>

                    {!!user ? (
                        <div
                            className="button_ mx-5 my-4"
                            onClick={acceptInvite}
                        >
                            Join Group
                        </div>

                    ) : (
                        <div
                            className="button_ mx-5 my-4"
                            onClick={() => {
                                setAcceptInviteOnLogin(true);
                                loginWithPopup();
                            }}
                        >
                            Join Group
                        </div>
                    )}

                </div>


            </div>
        </form>
    );
}

