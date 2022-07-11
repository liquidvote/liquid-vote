import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import useAuthUser from '@state/AuthUser/authUser.effect';

import LockSVG from "@shared/Icons/Lock-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import LinkSVG from "@shared/Icons/Link-tiny.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import Avatar from '@components/shared/Avatar';

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
            <div className="d-flex relative border-bottom py-3 mx-n3 px-3">
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
                            <div className="ml-2 d-flex align-items-center">
                                {group?.privacy === "private" ? (
                                    <LockSVG data-tip="private" />
                                ) : group?.privacy === "public" ? (
                                    <WorldSVG data-tip="public" />
                                ) : <LinkSVG data-tip="link only" />}
                            </div>
                        </div>
                        <div className="d-flex mb-1 ml-n1">
                            {
                                !alternativeButton && (
                                    <button
                                        onClick={() => !!liquidUser ? editGroupMemberChannelRelation({
                                            variables: {
                                                UserHandle: liquidUser?.handle,
                                                GroupHandle: group.handle,
                                                IsMember: !group?.yourMemberRelation?.isMember
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
                                        {editGroupMemberChannelRelation_loading && (
                                            <img
                                                className="vote-avatar mr-1 my-n2"
                                                src={'http://images.liquid-vote.com/system/loading.gif'}
                                            />
                                        )}
                                        {isMember ? "Joined" : "Join"}
                                    </button>
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
                            ...group.yourStats?.membersYouFollow || [],
                            // TODO: representatives
                            ...group?.stats?.mostRepresentingMembers.filter(
                                (m: any) => !group.yourStats?.membersYouFollow.find((mm: any) => mm.handle === m.handle)
                            )
                        ].slice(0, 7).map((m: any) => (
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
                            <small className='ml-2'>
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

