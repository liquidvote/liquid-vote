import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import env from '@env';
import useAuthUser from '@state/AuthUser/authUser.effect';
import LockSVG from "@shared/Icons/Lock-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
import GroupTiny from "@shared/Icons/Group-tiny.svg";
import LinkSVG from "@shared/Icons/Link-tiny.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import Avatar from '@components/shared/Avatar';
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";
import GroupInProfileListVotes from "@shared/GroupInProfileListVotes";
import useUser from '@state/User/user.effect';
import HandshakeSVG from "@shared/Icons/Handshake.svg";

import './style.sass';

export const GroupInProfileList: FunctionComponent<{
    group: any,
    alternativeButton?: any,
    user: any,
    isSelected: boolean
}> = ({
    group,
    alternativeButton,
    user,
    isSelected
}) => {

        let { section, subsection, subsubsection, handle, groupHandle } = useParams<any>();

        const { liquidUser } = useAuthUser();

        const { user: userWithMoreData } = useUser({ userHandle: user.handle, groupHandle: group.handle });

        // console.log({ user, userWithMoreData });

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

        useEffect(() => {
            isSelected && document?.getElementById?.(group.handle)?.scrollIntoView({ behavior: 'smooth' });
        }, [isSelected]);

        const isMember =
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember;

        const visibility: "everyone" | "members" | "self" =
            (group?.yourMemberRelation?.visibility ||
                editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.visibility
            ) ||
            (group?.privacy === 'private' ? 'members' : 'everyone');

        return (
            <div id={group.handle} className="relative border-bottom pb-3 mx-n3 px-3">
                <div className={`bg ${isSelected && 'sticky-top'}`}>
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
                            <div className="flex-fill py-2">
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center pt-1">
                                            <div className="d-flex align-items-center">
                                                <Link to={`/group/${group.handle}`} className="mr-2"><b>{group.name}</b></Link>
                                            </div>
                                            {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                                            {/* <div className="ml-2 mt-n1">
                                                {group?.privacy === "private" ? (
                                                    <LockSVG />
                                                ) : group?.privacy === "public" ? (
                                                    <WorldSVG />
                                                ) : <LinkSVG />}
                                            </div> */}
                                        </div>
                                    </div>
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
                                                    <button className={`button_ inverted small mr-1`}>
                                                        {visibility === 'everyone' && (
                                                            <WorldSVG data-tip="votes visible to everyone" />
                                                        )}
                                                        {visibility === 'members' && (
                                                            <GroupTiny data-tip="votes visible to other members" />
                                                        )}
                                                        {visibility === 'self' && (
                                                            <LockSVG data-tip="votes visible only to yourself" />
                                                        )}
                                                    </button>
                                                }
                                                oulineInstead={true}
                                                popperContent={
                                                    <ul className="d-flex justify-content-start m-0 mx-2 flex-column pointer">
                                                        <li
                                                            className="d-flex align-items-center py-2"
                                                        >
                                                            <p className={`m-0`}>Your votes are visible to:</p>
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
                                                                <WorldSVG data-tip="votes visible to everyone" />
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
                                                            <GroupTiny data-tip="votes visible to other members" />
                                                            <p className={`ml-2 m-0 ${visibility === 'members' && 'font-weight-bold'}`}>other members</p>
                                                        </li>
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
                                                            <LockSVG data-tip="votes visible only to yourself" />
                                                            <p className={`ml-2 m-0 ${visibility === 'self' && 'font-weight-bold'}`}>only yourself</p>
                                                        </li>
                                                    </ul>
                                                }
                                            />


                                            // <button className={`button_ inverted small mr-1`} onClick={() => {
                                            //     const selectedIndex = availableVisibilitytypes.indexOf(visibility);

                                            //     const nextVisibility = (selectedIndex + 1 === availableVisibilitytypes.length) ? availableVisibilitytypes[0] : availableVisibilitytypes[selectedIndex + 1];

                                            //     console.log({
                                            //         nextVisibility,
                                            //         availableVisibilitytypes,
                                            //         selectedIndex
                                            //     })

                                            //     editGroupMemberChannelRelation({
                                            //         variables: {
                                            //             UserHandle: liquidUser?.handle,
                                            //             GroupHandle: group.handle,
                                            //             Visibility: nextVisibility
                                            //         }
                                            //     })


                                            //     // setVoteVisibility((selectedIndex + 1 === availableVisibilitytypes.length) ? availableVisibilitytypes[0] : availableVisibilitytypes[selectedIndex + 1])
                                            // }}>
                                            //     {visibility === 'everyone' && (
                                            //         <WorldSVG data-tip="votes visible to everyone" />
                                            //     )}
                                            //     {visibility === 'members' && (
                                            //         <GroupTiny data-tip="votes visible to other members" />
                                            //     )}
                                            //     {visibility === 'self' && (
                                            //         <LockSVG data-tip="votes visible only to yourself" />
                                            //     )}
                                            // </button>) :
                                            // null
                                        ) : null}

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
                                            {isMember ? `Joined${group.thisUserIsAdmin ? ' as Admin' : ''}` : "Join"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='d-flex align-items-stretch mt-1 pb-3'>
                        <Link
                            className="position-relative mt-n1"
                            to={isSelected ? `/profile/${user.handle}/groups` : `/profile/${user.handle}/cause/${group.handle}`}
                        >
                            <Avatar
                                person={{
                                    ...user,
                                    yourStats: group.yourUserStats,
                                    stats: group.userStats
                                }}
                                groupHandle={group?.handle}
                                type="small"
                            />
                        </Link>
                        <div className='d-flex align-items-center'>
                            <div className='d-flex flex-column'>
                                <Link
                                    className="d-flex flex-column text-decoration-none"
                                    to={isSelected ? `/profile/${user.handle}/groups` : `/profile/${user.handle}/cause/${group.handle}`}
                                >
                                    {
                                        (userWithMoreData?.groupStats?.stats?.representedBy || userWithMoreData?.groupStats?.stats?.representing) ?
                                            <div className='d-flex align-items-center mb-1 ml-1'>

                                                <small className='primary-color d-flex'>
                                                    <>
                                                        {/* <div className="mr-1"><HandshakeSVG /></div> */}
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex flex-wrap">
                                                                {userWithMoreData?.groupStats?.stats?.representedBy ? (
                                                                    <>

                                                                        <Link to={`/profile-people/${user.handle}/representedBy`} className="mr-1">
                                                                            represents{' '}<b className="white ml-1">{userWithMoreData?.groupStats?.stats?.representedBy}</b>
                                                                        </Link>
                                                                    </>
                                                                ) : null}
                                                                {/* {userWithMoreData?.groupStats?.stats?.representing ? (
                                                                    <>
                                                                        ・
                                                                        <Link to={`/profile-people/${user.handle}/representing`}>
                                                                            is represented by{' '}<b className="white ml-1">{userWithMoreData?.groupStats?.stats?.representing}</b>
                                                                        </Link>
                                                                    </>
                                                                ) : null} */}
                                                            </div>
                                                        </div>
                                                    </>
                                                    {/* {group.representativeRelation?.isRepresentingYou && !group.youToHimRepresentativeRelation?.isRepresentingYou ? "represents you" : ""}
                                                    {!group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "represented by you" : ""}
                                                    {group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "you represent each other" : ""} */}
                                                </small>

                                                <div
                                                    className={`
                                                        d-flex align-items-center ${(group.youToHimRepresentativeRelation?.isRepresentingYou ||
                                                            group.representativeRelation?.isRepresentingYou
                                                        ) ? 'ml-1' : 'd-none'}
                                                    `}
                                                >
                                                    {group.representativeRelation?.isRepresentingYou &&
                                                        !group.youToHimRepresentativeRelation?.isRepresentingYou ?
                                                        (
                                                            <small
                                                                className="badge inverted"
                                                            >represents you</small>
                                                        ) : ""}
                                                    {group.youToHimRepresentativeRelation?.isRepresentingYou &&
                                                        !group.representativeRelation?.isRepresentingYou ?
                                                        (
                                                            <small
                                                                className="badge inverted"
                                                            >you represent him</small>
                                                        ) : ""}
                                                    {
                                                        group.youToHimRepresentativeRelation?.isRepresentingYou &&
                                                            group.representativeRelation?.isRepresentingYou ?
                                                            (
                                                                <small
                                                                    className="badge inverted no-max-w"
                                                                >you represent each other 🤝</small>
                                                            ) : ""
                                                    }
                                                </div>
                                            </div>
                                            :
                                            <></>
                                    }

                                    <div className="d-flex align-items-center">
                                        <small className={`d-flex mr-1 button_ small ${isSelected && 'inverted'}`}>
                                            <b className='white'>
                                                {' '}{group?.userStats?.directVotesMade} votes
                                                {' '}
                                                {isSelected ? '⬆' : '⬇'}
                                            </b>
                                        </small>
                                        {!!group?.yourUserStats?.directVotesInCommon ? (
                                            <>
                                                {/* ・
                                                <small className="d-flex mb-0">
                                                    <b className='white mr-1'>{' '}{group?.yourUserStats?.directVotesInCommon}</b> in common
                                                </small> */}

                                                <small className="d-flex align-items-center ml-1">
                                                    <b className='white mr-1 forDirect p-1 rounded'>{' '}{group?.yourUserStats?.directVotesInAgreement} </b> in agreement
                                                </small>
                                                ・
                                                <small className="d-flex align-items-center">
                                                    <b className='white mr-1 againstDirect p-1 rounded'>{' '}{group?.yourUserStats?.directVotesInDisagreement}</b> in disagreement
                                                </small>
                                            </>
                                        ) : <span className='opacity-0'>・</span>}
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className='d-flex align-items-center ml-auto'>
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
                                                        `Represents you on ${group?.name}` :
                                                        `Delegate your votes on ${group?.name} to ${user?.name}`
                                                }
                                            </button>
                                        </li>
                                        {liquidUser?.handle === user.handle && (
                                            <li className="d-flex mt-2 justify-content-center">
                                                <div
                                                    className="button_ small ml-2"
                                                    onClick={async () => {
                                                        const inviteLink = `${env.website}/invite/by/${liquidUser?.handle}/to/causeOnProfile/${group.handle}`;

                                                        try {
                                                            await navigator.share({
                                                                title: `Vote on ${group.name} with ${liquidUser?.name}`,
                                                                text: `${liquidUser?.name} is inviting you to vote on ${group.name} with him`,
                                                                url: inviteLink
                                                            })
                                                        } catch (err) {
                                                            updateParams({
                                                                paramsToAdd: {
                                                                    modal: "InviteFor",
                                                                    modalData: JSON.stringify({
                                                                        InviteType: 'toGroup',
                                                                        groupHandle: group.handle,
                                                                        groupName: group.name,
                                                                        inviteLink
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    }}
                                                >
                                                    Share Votes
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                }
                            />
                        </div>
                    </div>

                    {/* <pre>{JSON.stringify(group, null, 2)}</pre> */}
                    {/* <pre>{JSON.stringify(group.yourUserStats, null, 2)}</pre>
                    stats */}
                </div>

                {isSelected && (
                    <GroupInProfileListVotes
                        userHandle={handle}
                        groupHandle={groupHandle}
                        subsection={subsection}
                        subsubsection={subsubsection}
                    />
                )}
            </div>
        );
    }

