import React, { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";
import GroupSvg from "@shared/Icons/Group.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import ProfileSVG from "@shared/Icons/Profile.svg";
import XSVG from "@shared/Icons/X.svg";
import useGroup from '@state/Group/group.effect';
import useUser from '@state/User/user.effect';
import DropAnimation from '@components/shared/DropAnimation';
import useAuthUser from '@state/AuthUser/authUser.effect';
import {
    EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION
} from "@state/User/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const TopPageInvite: FunctionComponent<{
    inviterHandle: string,
    groupHandle?: string,
    voteName?: string,
    userHandle?: string,
    to: 'group' | 'poll' | 'compareWithProfile'
}> = ({
    inviterHandle,
    groupHandle,
    userHandle,
    voteName,
    to
}) => {

        const navigate = useNavigate();
        const { updateParams } = useSearchParams();
        let { handle, section, acceptOnLogin } = useParams<any>();

        const { liquidUser } = useAuthUser();
        const { user: inviter } = useUser({ userHandle: inviterHandle });
        const { user: user_ } = useUser({ userHandle });
        const { group } = useGroup({ handle: groupHandle });
        const { loginWithPopup, user, isAuthenticated, isLoading } = useAuth0();

        const isMember = !!liquidUser && group?.yourMemberRelation?.isMember;

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION, {
            update: cache => {
                cache.evict({
                    id: `Group:${groupHandle}`,
                    broadcast: true,
                });
                cache.gc();
            }
        });

        useEffect(() => {
            if (!!acceptOnLogin && !!liquidUser) {
                acceptInvite();
            }
        }, [liquidUser]);

        const acceptInvite = async () => {
            if (!!liquidUser) {
                if (to === 'group') {
                    editGroupMemberChannelRelation({
                        variables: {
                            UserHandle: liquidUser?.handle,
                            GroupHandle: groupHandle,
                            // InviteId: allSearchParams?.inviteId,
                            IsMember: true
                        }
                    }).then(() => {
                        // setAcceptInviteOnLogin(false);
                        // updateParams({
                        //     keysToRemove: ['modal', 'modalData'],
                        //     paramsToAdd: { refetch: 'group' }
                        // });
                    });
                }
            } else {

                navigate(`/invite/by/${inviterHandle}/to/group/${groupHandle}/joinOnLogin`, { replace: true });

                const login = await loginWithPopup();

                // try {
                //     await loginWithPopup();
                // } catch (e) {
                //     console.log({
                //         e
                //     });
                // }
            }
        };

        return (
            <div className="position-relative">
                <div
                    className="close-corner-x"
                    onClick={() => 
                            to === 'poll' ? navigate(`/poll/${voteName}/${groupHandle}`) :
                            to === 'group' ? navigate(`/group/${groupHandle}`) :
                            to === 'compareWithProfile' ? navigate(`/profile/${userHandle}`) :
                            null
                    }
                    role="button"
                >
                    <XSVG />
                </div>


                {!!inviter ? (
                    <div className="d-flex flex-column justify-content-center">
                        <div className={`
                            ${to === 'poll' ? 'mt-2' : 'mt-4'}
                            d-flex justify-content-center align-items-center mb-2 px-5
                        `}>
                            <div
                                className="small-avatar bg"
                                style={{
                                    background: inviter?.avatar && `url(${inviter.avatar}) 50% 50% / cover no-repeat`
                                }}
                            />
                            <p className="m-0">
                                {to === 'group' && `${inviter?.name} is inviting you to join ${group?.name}`}
                                {to === 'poll' && `${inviter?.name} is inviting you to vote`}
                                {to === 'compareWithProfile' && `${inviter?.name} is inviting you to compare with ${inviter?.handle === user_?.handle ? "him" : user_.name}`}
                            </p>
                        </div>

                        {to === 'group' && (
                            <>
                                {((!isMember && (!!isLoading || editGroupMemberChannelRelation_loading)) || !group || !inviter) ? (
                                    <div className="mx-5 my-4 text-center">
                                        <img
                                            className="vote-avatar"
                                            src={'http://images.liquid-vote.com/system/loading.gif'}
                                        />
                                    </div>
                                ) : (!!isMember && !!group) ? (
                                    <p className="mx-5 mb-5 text-center"><b>You are now a member 🎉</b></p>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <button
                                            className="button_ mx-5 mb-5"
                                            onClick={acceptInvite}
                                            disabled={editGroupMemberChannelRelation_loading}
                                        >Join Group</button>
                                    </div>
                                )}

                                {isMember && (
                                    <div className={
                                        `d-flex flex-column align-items-center justify-content-center mb-5`
                                    }>
                                        <p className="">Delegate your unused votes to some people</p>

                                        <div
                                            className="button_"
                                            onClick={() => updateParams({
                                                paramsToAdd: {
                                                    modal: "ChooseRepresentatives",
                                                    modalData: JSON.stringify({
                                                        groupHandle: group.handle
                                                    })
                                                }
                                            })}
                                        >
                                            Choose Representatives
                                        </div>

                                        {/* <ChooseRepresentatives inviterHandle={user?.handle} /> */}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                ) : (
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                )}

            </div>
        );
    }

