import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import useAuthUser from '@state/AuthUser/authUser.effect';

import LockSVG from "@shared/Icons/Lock.svg";
import WorldSVG from "@shared/Icons/World.svg";
import WorldlockSVG from "@shared/Icons/Worldlock.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";

import './style.sass';

export const GroupInList: FunctionComponent<{
    group: any,
    inviteButton?: any,
    alternativeButton?: any
}> = ({
    group,
    inviteButton,
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
            group?.yourMemberRelation ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        return (
            <div className="d-flex relative border-bottom py-3 mx-n3 px-3">
                <Link to={`/group/${group.handle}/polls`}>
                    <div
                        className={`small-avatar bg`}
                        style={{
                            background: group.cover && `url(${group.cover}) no-repeat`,
                            backgroundSize: 'cover'
                        }}
                    ></div>
                </Link>
                <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center mb-1 ">
                            <Link to={`/group/${group.handle}/polls`}><b>{group.name}</b></Link>
                            {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                            <div className="ml-2">
                                {group.privacy === "private" ? (
                                    <LockSVG />
                                ) : (
                                    <WorldSVG />
                                )}
                                {/* <LockSVG /> */}
                                {/* <WorldlockSVG /> */}
                            </div>
                        </div>
                        <div className="d-flex mb-1 ml-n1">
                            {inviteButton}
                            {
                                !alternativeButton && (
                                    group.thisUserIsAdmin ? (
                                        <div
                                            onClick={() => updateParams({
                                                paramsToAdd: {
                                                    modal: "EditGroup",
                                                    modalData: JSON.stringify({ groupHandle: group.handle })
                                                }
                                            })}
                                            className={`button_ small ml-1 mb-0`}
                                        >
                                            Edit
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => editGroupMemberChannelRelation({
                                                variables: {
                                                    UserHandle: liquidUser?.handle,
                                                    GroupHandle: group.handle,
                                                    IsMember: !group?.yourMemberRelation?.isMember
                                                }
                                            })}
                                            className={`button_ small ml-1 mb-0 ${isMember ? "selected" : ""}`}
                                        >
                                            {isMember ? "Joined" : "Join"}
                                        </div>
                                    )
                                )
                            }
                            {alternativeButton ? alternativeButton : null}
                        </div>
                    </div>
                    <small className="d-flex mb-0">
                        {group.bio}
                        {/* A community of locals and expats. That own flats in Algarve.
                    For personal use, Airbnb, long term renting or whatever. */}
                    </small>
                    <div className="d-flex ml-2 mt-2">
                        {group?.stats?.mostRepresentingMembers?.slice(0, 6).map((m: any) => (
                            <Link
                                to={`/profile/${m.handle}`}
                                title={`${m.name}`}
                                className="vote-avatar avatar-2 ml-n2"
                                style={{
                                    background: `url(${m.avatar}) no-repeat`,
                                    backgroundSize: 'cover'
                                }}
                            ></Link>
                        ))}
                        <Link
                            to={`/group-people/${group.handle}/members`}
                        >
                            <div className="vote-avatar count ml-n2">{group?.stats?.members}</div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

