import React, { FunctionComponent } from 'react';
import { useMutation } from "@apollo/client";

import Popper from "@shared/Popper";
import LockSVG from "@shared/Icons/Lock-tiny.svg";
import ProfileSVG from "@shared/Icons/Profile-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import GroupTiny from "@shared/Icons/Group-tiny.svg";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const GroupVisibilityPicker: FunctionComponent<{
    group: any
}> = ({
    group
}) => {

        const { liquidUser } = useAuthUser();

        const { allSearchParams, updateParams } = useSearchParams();

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

        const visibility: "everyone" | "members" | "following" | "self" =
            (group?.yourMemberRelation?.visibility ||
                editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.visibility
            ) ||
            (group?.privacy === 'private' ? 'members' : 'everyone');

        const isMember =
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        return (
            <div className="d-flex ml-n1 justify-content-center align-items-center">
                {editGroupMemberChannelRelation_loading && (
                    <img
                        className="vote-avatar mr-1 my-n2"
                        src={'http://images.liquid-vote.com/system/loading.gif'}
                    />
                )}

                {isMember ? (
                    <Popper
                        rightOnSmall={true}
                        button={
                            <div className='d-flex align-items-center'>
                                <small>
                                    {visibility === 'everyone' && (
                                        "everyone"
                                    )}
                                    {visibility === 'members' && (
                                        "members")}
                                    {visibility === 'following' && (
                                        "following"
                                    )}
                                    {visibility === 'self' && (
                                        "only yourself"
                                    )}
                                </small>
                                <button className={`button_ inverted small mx-1`}>
                                    {visibility === 'everyone' && (
                                        <WorldSVG data-tip="votes visible to everyone" />
                                    )}
                                    {visibility === 'members' && (
                                        <GroupTiny data-tip="votes visible to other members" />
                                    )}
                                    {visibility === 'following' && (
                                        <ProfileSVG data-tip="votes visible to people you follow" />
                                    )}
                                    {visibility === 'self' && (
                                        <LockSVG data-tip="votes visible only to yourself" />
                                    )}
                                </button>
                            </div>
                        }
                        oulineInstead={true}
                        popperContent={
                            <ul className="d-flex justify-content-start m-0 mx-2 flex-column pointer">
                                <li
                                    className="d-flex align-items-center py-2"
                                >
                                    <p className={`m-0`}>Your votes and membership are visible to:</p>
                                </li>
                                {group.privacy !== 'private' ? (
                                    <li
                                        className="d-flex align-items-center py-2"
                                        onClick={() => editGroupMemberChannelRelation({
                                            variables: {
                                                UserHandle: liquidUser?.handle,
                                                GroupHandle: group.handle,
                                                Visibility: 'everyone'
                                            }
                                        })}
                                    >
                                        <WorldSVG />
                                        <p className={`ml-2 m-0 ${visibility === 'everyone' && 'font-weight-bold'}`}>everyone</p>
                                    </li>
                                ) : null}
                                <li
                                    className="d-flex align-items-center py-2"
                                    onClick={() => editGroupMemberChannelRelation({
                                        variables: {
                                            UserHandle: liquidUser?.handle,
                                            GroupHandle: group.handle,
                                            Visibility: 'members'
                                        }
                                    })}
                                >
                                    <GroupTiny />
                                    <p className={`ml-2 m-0 ${visibility === 'members' && 'font-weight-bold'}`}>other members</p>
                                </li>
                                {group.privacy !== 'private' ? (
                                    <li
                                        className="d-flex align-items-center py-2"
                                        onClick={() => editGroupMemberChannelRelation({
                                            variables: {
                                                UserHandle: liquidUser?.handle,
                                                GroupHandle: group.handle,
                                                Visibility: 'following'
                                            }
                                        })}
                                    >
                                        <ProfileSVG />
                                        <p className={`ml-2 m-0 ${visibility === 'following' && 'font-weight-bold'}`}>people you follow</p>
                                    </li>
                                ) : null}
                                <li
                                    className="d-flex align-items-center py-2"
                                    onClick={() => editGroupMemberChannelRelation({
                                        variables: {
                                            UserHandle: liquidUser?.handle,
                                            GroupHandle: group.handle,
                                            Visibility: 'self'
                                        }
                                    })}
                                >
                                    <LockSVG />
                                    <p className={`ml-2 m-0 ${visibility === 'self' && 'font-weight-bold'}`}>only yourself 🧪</p>
                                </li>
                            </ul>
                        }
                    />
                ) : liquidUser ? (
                    <div className='d-flex align-items-center justify-content-center'>
                        <small>
                            only yourself
                        </small>
                        <div className='mx-1 d-flex align-items-center justify-content-center'>
                            <LockSVG data-tip="votes visible only to yourself" />
                        </div>
                    </div>
                ) : null}
                <button
                    onClick={() => !!liquidUser ? editGroupMemberChannelRelation({
                        variables: {
                            UserHandle: liquidUser?.handle,
                            GroupHandle: group.handle,
                            IsMember: !isMember
                        }
                    }) : updateParams({
                        paramsToAdd: {
                            modal: "RegisterBefore",
                            modalData: JSON.stringify({
                                toWhat: 'joinGroup',
                                groupHandle: group.handle,
                                groupName: group.name
                            })
                        }
                    })}
                    className={`button_ small ml-1 mb-0 ${isMember ? "selected" : ""}`}
                    disabled={group.thisUserIsAdmin}
                >
                    {isMember ?
                        group.thisUserIsAdmin ?
                            'Admin' :
                            'Joined' :
                        "Join"
                    }
                </button>
            </div>
        );
    }
