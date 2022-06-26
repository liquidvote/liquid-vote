import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { useMutation, useQuery } from "@apollo/client";

import DropAnimation from '@components/shared/DropAnimation';
import VoteSortPicker from '@components/shared/VoteSortPicker';
import Header from "@shared/Header";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import LinkSmallSVG from "@shared/Icons/Link-small.svg";
import LinkSVG from "@shared/Icons/Link.svg";
import LockSVG from "@shared/Icons/Lock.svg";
import WorldSVG from "@shared/Icons/World.svg";
import ProfileSmallSVG from "@shared/Icons/Profile-small.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";
import useGroup from '@state/Group/group.effect';
import useUserRepresentedBy from "@state/User/userRepresentedBy.effect";
import { timeAgo } from '@state/TimeAgo';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import TopPageInvite from '@components/shared/TopPageInvite';
import env from '@env';
import InviteTinySvg from "@shared/Icons/Invite-tiny.svg";

import GroupPolls from './GroupPolls';
import GroupVotes from './GroupVotes';
import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    const navigate = useNavigate();
    let { handle, section, userHandle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const [sortBy, setSortBy] = useState('time');

    const { group, group_refetch } = useGroup({ handle });

    const [editGroupMemberChannelRelation, {
        loading: editGroupMemberChannelRelation_loading,
        error: editGroupMemberChannelRelation_error,
        data: editGroupMemberChannelRelation_data,
    }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

    const { liquidUser } = useAuthUser();

    const { representatives } = useUserRepresentedBy({
        userHandle: liquidUser?.handle,
        groupHandle: group?.handle
    });

    useEffect(() => {
        if (allSearchParams.refetch === 'group') {
            group_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [group]);

    // useEffect(() => {
    //     if (!!userHandle) {
    //         const link = `/group/${handle}?${new URLSearchParams({
    //             modal: 'AcceptInvite',
    //             modalData: JSON.stringify({
    //                 // toWhat: 'group',
    //                 // groupName: groupName,
    //                 // groupHandle: groupHandle,
    //                 // fromWhomAvatar: fromWhomAvatar,
    //                 // fromWhomName: fromWhomName,
    //                 // fromWhomHandle: fromWhomHandle

    //                 to: 'group',
    //                 by: userHandle,
    //                 groupHandle: handle

    //             })
    //         }).toString()}`;

    //         navigate(link, { replace: true });
    //     }
    // }, [userHandle]);

    const isMember =
        !!liquidUser && (
            group?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember
        );

    return !group ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : (
        <>
            <Header title={group?.name} iconType="group" />

            {!!userHandle && (
                <TopPageInvite
                    inviterHandle={userHandle}
                    groupHandle={handle}
                    to="group"
                />
            )}

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                    }}
                />
            </div>
            <div className="d-flex flex-wrap mt-2 mb-n1 justify-content-between flex-nowrap">
                <div className="d-flex flex-column mb-1 mr-1 flex-nowrap">
                    <h4 className="d-flex white align-items-start m-0">
                        {group?.name}
                        <div className="ml-2">
                            {group?.privacy === "private" ? (
                                <LockSVG />
                            ) : group?.privacy === "public" ? (
                                <WorldSVG />
                            ) : <LinkSVG />}
                        </div>
                    </h4>
                    <p className="profile-handle">@{group?.handle}</p>
                </div>
                <div className="d-flex mb-n1 ml-n1 flex-wrap align-content-start justify-content-end">
                    {isMember && (
                        <>
                            <div
                                className="button_ small mb-2 ml-2"
                                onClick={async () => {
                                    const inviteLink = `${env.website}/invite/by/${liquidUser?.handle}/to/group/${group.handle}`;

                                    try {
                                        await navigator.share({
                                            title: `Vote on ${group.name} with ${liquidUser?.name}`,
                                            text: `${liquidUser?.name} is inviting you to vote on ${group.name}`,
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
                                <InviteTinySvg />
                            </div>
                            <div
                                className="button_ small mb-2 ml-2"
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
                        </>
                    )}
                    {
                        group?.thisUserIsAdmin ? (
                            <div
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "EditGroup",
                                        modalData: JSON.stringify({ groupHandle: group?.handle })
                                    }
                                })}
                                className={`button_ small ml-2 mb-2`}
                            >
                                Edit
                            </div>
                        ) : (
                            <div
                                onClick={() => !!liquidUser ? editGroupMemberChannelRelation({
                                    variables: {
                                        UserHandle: liquidUser?.handle,
                                        GroupHandle: group?.handle,
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
                                className={`button_ small ml-2 mb-0 ${isMember ? "selected" : ""}`}
                            >
                                {editGroupMemberChannelRelation_loading && (
                                    <img
                                        className="vote-avatar mr-1 my-n2"
                                        src={'http://images.liquid-vote.com/system/loading.gif'}
                                    />
                                )}
                                {isMember ? "Joined" : "Join"}
                            </div>
                        )}
                    {/* <div
                        onClick={() => setIsRepresenting(!isRepresenting)}
                        className={`button_ small mb-0 ${isRepresenting ? "selected" : ""}`}
                    >
                        {isRepresenting ? "Represents You" : "Delegate Votes To"}
                    </div> */}
                </div>
            </div>
            <div className="profile-description pre-wrap">
                {group?.bio}
            </div>
            <div className="profile-icons-container d-flex mt-2">
                {/* <div>
                    <LocationSVG />
                    <div>{group?.bio}</div>
                </div> */}
                {group?.externalLink && (
                    <div>
                        <div className="mr-1"><LinkSmallSVG /></div>
                        <a
                            href={`//${group?.externalLink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="white"
                        >
                            {group?.externalLink}
                        </a>
                    </div>
                )}
                <div>
                    <div className="mr-1"><CalendarSVG /></div>
                    <div>Group created {timeAgo.format(new Date(Number(group?.createdOn)))}</div>
                </div>
            </div>
            <div className="profile-stats-container flex-nowrap mt-2">
                <div className="mr-1"><ProfileSmallSVG /></div>
                <div className="d-flex flex-wrap">
                    <Link className="mr-2" to={`/group-people/${group?.handle}/members`}>
                        <b className="white">{group?.stats?.members || 0}</b> Member{group?.stats?.members !== 1 && 's'}
                    </Link>
                    {
                        group?.yourStats && (
                            <>
                                <Link className="mr-2" to={`/group-people/${group?.handle}/representingYou`}>
                                    <b className="white">{0}</b> Following you
                                </Link>
                                <Link className="mr-2" to={`/group-people/${group?.handle}/representingYou`}>
                                    <b className="white">{0}</b> Followed by you
                                </Link>
                                <Link className="mr-2" to={`/group-people/${group?.handle}/representingYou`}>
                                    <b className="white">{group?.yourStats.representing || 0}</b> Representing you
                                </Link>
                                <Link to={`/group-people/${group?.handle}/representedByYou`}>
                                    <b className="white">{group?.yourStats.representedBy || 0}</b> Represented by you
                                </Link>
                            </>
                        )
                    }
                </div>
            </div>
            {/* <div className="profile-stats-container flex-nowrap mb-4 mt-2">
                <div className="mr-1"><DropSVG /></div>
                <div className="d-flex flex-wrap">
                    <div
                        className="mr-2 pointer"
                        onClick={
                            e => {
                                e.stopPropagation();
                                updateParams({
                                    paramsToAdd: {
                                        modal: "ListVoters",
                                        modalData: JSON.stringify({
                                            groupHandle: group?.handle,
                                            subsection: 'direct',
                                        })
                                    }
                                })
                            }
                        }
                    >
                        <b className="white">{group?.stats?.directVotesMade || 0}</b> Vote{group?.stats?.directVotesMade !== 1 && 's'}
                    </div>
                    {
                        group?.yourStats && (
                            <>
                                <div
                                    className="mr-2 pointer"
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        groupHandle: group?.handle,
                                                        subsection: 'represented',
                                                        subsubsection: 'byyou'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="white">{(
                                        group?.yourStats.directVotesMade +
                                        group?.yourStats.indirectVotesMadeByYou
                                    ) || 0}</b> By you
                                </div>
                                <div
                                    className="mr-2 pointer"
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        groupHandle: group?.handle,
                                                        subsection: 'represented',
                                                        subsubsection: 'foryou'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="white">{group?.yourStats.indirectVotesMadeForYou || 0}</b> For you
                                </div>
                            </>
                        )
                    }
                </div>
            </div> */}

            {
                isMember && (
                    <div className="d-flex justify-content-center mt-3 mb-3">
                        <div
                            onClick={() => updateParams({
                                paramsToAdd: {
                                    modal: "EditQuestion",
                                    modalData: JSON.stringify({
                                        questionText: 'new',
                                        groupHandle: handle,
                                    })
                                }
                            })}
                            className="button_ mx-5 my-3 mb-4"
                        >
                            <DropPlusSVG />
                            <div className="ml-2">Create a new Poll</div>
                        </div>
                    </div>
                )
            }


            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${group?.handle}/polls`}>
                        <b>{group?.stats?.questions}</b>{' '}Polls
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${section === 'votes' && 'active'}`} to={`/group/${group?.handle}/votes`}>
                        <b>{group?.stats?.directVotesMade}</b>{' '}
                        Votes
                    </Link>
                </li> */}
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>

            {/* <pre style={{ color: 'white' }}>{JSON.stringify(group, null, 2)}</pre> */}

            <hr />

            {
                (!section || section === 'polls') && (
                    <div>
                        <GroupPolls sortBy={sortBy} />
                    </div>
                )
            }
            {
                (section === 'votes') && (
                    <GroupVotes sortBy={sortBy} />
                )
            }

        </>
    );
}

