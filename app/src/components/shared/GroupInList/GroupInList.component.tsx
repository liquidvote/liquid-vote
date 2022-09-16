import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import useAuthUser from '@state/AuthUser/authUser.effect';

import LockSVG from "@shared/Icons/Lock-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import LinkSVG from "@shared/Icons/Link-tiny.svg";
import ProfileSVG from "@shared/Icons/Profile-tiny.svg";
import GroupTiny from "@shared/Icons/Group-tiny.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import Avatar from '@components/shared/Avatar';
import Popper from "@shared/Popper";
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import GroupVisibilityPicker from '@components/shared/GroupVisibilityPicker';

import './style.sass';

export const GroupInList: FunctionComponent<{
    group: any,
    alternativeButton?: any
}> = ({
    group,
    alternativeButton,
}) => {

        const { liquidUser } = useAuthUser();

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

        const { allSearchParams, updateParams } = useSearchParams();

        const isMember =
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        return (
            <div className="d-flex relative border-bottom py-4 mx-n3 px-3">
                <Link to={`/group/${group.handle}`}>
                    <div
                        className={`small-avatar square bg`}
                        style={{
                            background: group.cover && `url(${group.cover}) 50% 50% / cover no-repeat`
                        }}
                    ></div>
                </Link>
                <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center mb-1 ">
                            <Link to={`/group/${group.handle}`}><b>{group.name}</b></Link>
                            {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                            {/* <div className="ml-2 d-flex align-items-center">
                                {group?.privacy === "private" ? (
                                    <LockSVG data-tip="private" />
                                ) : group?.privacy === "public" ? (
                                    <WorldSVG data-tip="public" />
                                ) : <LinkSVG data-tip="link only" />}
                            </div> */}
                        </div>
                        <div className="d-flex mb-1 ml-n1">
                            {
                                !alternativeButton && (
                                    <>
                                        <GroupVisibilityPicker
                                            group={group}
                                        />
                                    </>
                                )
                            }
                            {alternativeButton ? alternativeButton : null}
                        </div>
                    </div>
                    <small className="d-flex mb-0">
                        {group.bio}
                    </small>
                    <div className="d-flex align-items-center ml-n5 mt-3">
                        {[
                            ...group?.yourStats?.membersYouFollow || [],
                            // TODO: representatives
                            ...group?.stats?.mostRepresentingMembers?.filter(
                                (m: any) => !group.yourStats?.membersYouFollow?.find((mm: any) => mm.handle === m.handle)
                            ) || []
                        ].slice(0, 3).map((m: any) => (
                            <Link
                                key={m.handle + group.handle}
                                to={`/profile/${m.handle}/cause/${group.handle}`}
                                title={`${m.name}`}
                            >
                                <Avatar
                                    person={{
                                        ...m,
                                        yourStats: m.yourStats,
                                        stats: m.stats
                                    }}
                                    groupHandle={group.handle}
                                    type="vote"
                                />
                            </Link>
                        ))}
                        <Link
                            to={`/group-people/${group.handle}/members`}
                            className="vote-avatar count"
                        >
                            <div>{group?.stats?.members}</div>
                        </Link>

                        {group.yourStats?.membersYouFollow?.length ? (
                            <small className='ml-2 faded'>
                                {group.yourStats?.membersYouFollow.slice(0, 3).map((m: any, i) => (
                                    <>
                                        {' '}
                                        <Link
                                            key={`groupFollower_name-${group?.handle}-${m.handle}`}
                                            to={`/profile/${m.handle}/cause/${group.handle}`}
                                            title={`${m.name}`}
                                        >{m.name}</Link>
                                        {(i + 2) < group.yourStats?.membersYouFollow?.length ? ", " : ""}
                                        {(i + 2) === group.yourStats?.membersYouFollow?.length ? " and " : ""}
                                        {i === 2 && group.yourStats?.membersYouFollow?.length > 3 ? ` and ${group.yourStats?.membersYouFollow?.length - 3} other you follow ` : ""}
                                    </>
                                ))}
                                {' '}
                                {group.yourStats?.membersYouFollow?.length > 1 ? 'are members' : 'is a member'}
                            </small>
                        ) : null}


                    </div>
                </div>
            </div>
        );
    }

