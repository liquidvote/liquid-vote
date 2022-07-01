import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import env from '@env';
import useAuthUser from '@state/AuthUser/authUser.effect';
import LockSVG from "@shared/Icons/Lock-tiny.svg";
import WorldSVG from "@shared/Icons/World-tiny.svg";
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

        console.log({ user, userWithMoreData });

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
                            {/* <Link to={`/group/${group?.handle}`}>
                                <h5 className="white p-0 m-0">
                                    {group?.name}
                                </h5>
                            </Link> */}

                            <Link
                                className="position-relative"
                                style={{ top: 10 }}
                                to={isSelected ? `/profile/${user.handle}` : `/profile/${user.handle}/cause/${group.handle}`}
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
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center">
                                            <Link to={`/group/${group.handle}`}><b>{group.name}</b></Link>
                                            {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                                            <div className="ml-2 mt-n1">
                                                {group?.privacy === "private" ? (
                                                    <LockSVG />
                                                ) : group?.privacy === "public" ? (
                                                    <WorldSVG />
                                                ) : <LinkSVG />}
                                            </div>
                                        </div>
                                        <small className='primary-color d-flex'>
                                            {
                                                (userWithMoreData?.groupStats?.stats?.representedBy || userWithMoreData?.groupStats?.stats?.representing) ?
                                                    <>
                                                        {/* <div className="mr-1"><HandshakeSVG /></div> */}
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex flex-wrap">
                                                                {userWithMoreData?.groupStats?.stats?.representedBy ? (
                                                                    <Link to={`/profile-people/${user.handle}/representedBy`} className="mr-2">
                                                                        Representing{' '}<b className="white">{userWithMoreData?.groupStats?.stats?.representedBy}</b>
                                                                        {group.representativeRelation?.isRepresentingYou ? " (including you)" : ""}
                                                                    </Link>
                                                                ) : null}
                                                                {userWithMoreData?.groupStats?.stats?.representing ? (
                                                                    <Link to={`/profile-people/${user.handle}/representing`} className="mr-2">
                                                                        Represented by{' '}<b className="white">{userWithMoreData?.groupStats?.stats?.representing}</b>
                                                                        {group.youToHimRepresentativeRelation?.isRepresentingYou ? " (including you)" : ""}
                                                                    </Link>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </> :
                                                    <></>
                                            }
                                            {/* {group.representativeRelation?.isRepresentingYou && !group.youToHimRepresentativeRelation?.isRepresentingYou ? "represents you" : ""}
                                            {!group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "represented by you" : ""}
                                            {group.representativeRelation?.isRepresentingYou && group.youToHimRepresentativeRelation?.isRepresentingYou ? "you represent each other" : ""} */}
                                        </small>
                                    </div>
                                    <div className="d-flex ml-n1 justify-content-center">
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

                    <Link
                        style={{ marginLeft: 58 }}
                        className="d-flex flex-column text-decoration-none"
                        to={isSelected ? `/profile/${user.handle}` : `/profile/${user.handle}/cause/${group.handle}`}
                    >
                        <div className="d-flex">
                            <small className="d-flex mb-0">
                                <b className='white mr-1'>{' '}{group?.userStats?.directVotesMade}</b> votes
                            </small>
                            {!!group?.yourUserStats?.directVotesInCommon && (
                                <>
                                    {/* ・
                                    <small className="d-flex mb-0">
                                        <b className='white mr-1'>{' '}{group?.yourUserStats?.directVotesInCommon}</b> in common
                                    </small> */}
                                    ・
                                    <small className="d-flex mb-0">
                                        <b className='white mr-1'>{' '}{group?.yourUserStats?.directVotesInAgreement} </b> in agreement
                                    </small>
                                    ・
                                    <small className="d-flex mb-0">
                                        <b className='white mr-1'>{' '}{group?.yourUserStats?.directVotesInDisagreement}</b> in disagreement
                                    </small>
                                </>
                            )}
                        </div>
                        <small className='white'>
                            {isSelected ? 'hide' : 'show'} votes
                        </small>
                        {/* <div style={{ marginRight: 2, marginTop: -5 }}>⬇</div> */}
                    </Link>

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

