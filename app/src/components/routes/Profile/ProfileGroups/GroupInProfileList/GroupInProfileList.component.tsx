import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import useAuthUser from '@state/AuthUser/authUser.effect';

import LockSVG from "@shared/Icons/Lock-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import LinkSVG from "@shared/Icons/Link-tiny.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import Avatar from '@components/shared/Avatar';
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";

import './style.sass';

export const GroupInProfileList: FunctionComponent<{
    group: any,
    alternativeButton?: any,
    user: any
}> = ({
    group,
    alternativeButton,
    user
}) => {

        const { liquidUser } = useAuthUser();

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

        const [editUserRepresentativeGroupRelation, {
            loading: editUserRepresentativeGroupRelation_loading,
            error: editUserRepresentativeGroupRelation_error,
            data: editUserRepresentativeGroupRelation_data,
        }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION);

        const { allSearchParams, updateParams } = useSearchParams();

        const isMember =
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        return (
            <div className="relative border-bottom pb-3 mx-n3 px-3">
                <div className="groupInProfile-cover-container">
                    <div
                        className="poll-cover"
                        style={{
                            background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                        }}
                    />
                    <div className="poll-cover-overlay">
                    </div>
                    <div className="poll-cover-info">
                        {/* <Link to={`/group/${group?.handle}`}>
                            <h5 className="white p-0 m-0">
                                {group?.name}
                            </h5>
                        </Link> */}

                        <Link className="position-relative" style={{ top: 10 }} to={`/profile/${user.handle}`}>
                            <Avatar
                                person={{
                                    ...user,
                                    yourStats: group.yourUserStats
                                }}
                                type="small"
                            />
                        </Link>

                        {/* <Link to={`/group/${group.handle}`}>
                            <div
                                className={`small-avatar square bg`}
                                style={{
                                    background: group.cover && `url(${group.cover}) 50% 50% / cover no-repeat`
                                }}
                            ></div>
                        </Link> */}
                        <div className="flex-fill py-2">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div className="d-flex align-items-center">
                                    <Link to={`/group/${group.handle}`}><b>{group.name}</b></Link>
                                    {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                                    <div className="ml-2">
                                        {group?.privacy === "private" ? (
                                            <LockSVG />
                                        ) : group?.privacy === "public" ? (
                                            <WorldSVG />
                                        ) : <LinkSVG />}
                                    </div>
                                </div>
                                <div className="d-flexml-n1">
                                    <Popper
                                        rightOnSmall={true}
                                        button={
                                            <div>
                                                <ThreeDotsSmallSVG />
                                            </div>
                                        }
                                        oulineInstead={true}
                                        popperContent={
                                            <ul className="p-0 m-0 mx-2">
                                                <li className="d-flex justify-content-center mb-2">
                                                    <button
                                                        onClick={
                                                            () => editUserRepresentativeGroupRelation({
                                                                variables: {
                                                                    RepresenteeHandle: liquidUser?.handle,
                                                                    RepresentativeHandle: user?.handle,
                                                                    Group: group.handle,
                                                                    IsRepresentingYou: !group.representativeRelation?.isRepresentingYou
                                                                }
                                                            })
                                                                .then((r) => {
                                                                    // userGroups_refetch();
                                                                    updateParams({ paramsToAdd: { refetch: 'user' } })
                                                                })
                                                        }
                                                        className={`
                                                            button_ small ml-1 mb-0
                                                            ${group.representativeRelation?.isRepresentingYou ? 'selected' : null}
                                                        `}
                                                        disabled={!group.yourMemberRelation?.isMember}
                                                    >
                                                        {
                                                            group.representativeRelation?.isRepresentingYou ?
                                                                `Represents you` :
                                                                `Delegate to ${user?.name}`
                                                        }
                                                    </button>
                                                </li>
                                                <li className="d-flex justify-content-center">
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
                                                                src={'http://images.liquid-vote.com/system/loadingroup.gif'}
                                                            />
                                                        )}
                                                        {isMember ? "Joined" : "Join"}
                                                    </button>
                                                </li>
                                            </ul>
                                        }
                                    />
                                </div>
                            </div>
                            {/* <small className="d-flex mb-0 mt-n1 primary-color">
                                {group.bio}
                            </small> */}
                            {/* <div className="d-flex ml-2 mt-2">
                                {group?.stats?.mostRepresentingMembers?.slice(0, 6).map((m: any) => (
                                    <Link
                                        key={m.handle}
                                        to={`/profile/${m.handle}`}
                                        title={`${m.name}`}
                                        className="vote-avatar avatar-2 ml-n2"
                                        style={{
                                            background: `url(${m.avatar}) 50% 50% / cover no-repeat`
                                        }}
                                    ></Link>
                                ))}
                                <Link
                                    to={`/group-people/${group.handle}/members`}
                                >
                                    <div className="vote-avatar count ml-n2">{group?.stats?.members}</div>
                                </Link>
                            </div> */}

                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <div style={{ marginLeft: 58 }}>
                        {!!group?.yourUserStats?.directVotesInCommon && (
                            <small className="d-flex mb-0">
                                <b className='white mr-1'>{' '}{group?.yourUserStats?.directVotesInCommon}</b> votes in common
                            </small>
                        )}
                    </div>
                    {/* <div style={{ marginRight: 2, marginTop: -5 }}>⬇</div> */}
                </div>
            </div>
        );
    }

