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
import HandshakeSVG from "@shared/Icons/Handshake.svg";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";
import useGroup from '@state/Group/group.effect';
import useUserRepresentedBy from "@state/User/userRepresentedBy.effect";
import { timeAgo } from '@state/TimeAgo';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import TopPageInvite from '@components/shared/TopPageInvite';
import env from '@env';
import InviteTinySvg from "@shared/Icons/Invite-tiny.svg";
import Avatar from '@components/shared/Avatar';
import GroupVisibilityPicker from '@components/shared/GroupVisibilityPicker';
import MetaTags from "@components/shared/MetaTags";

import GroupPolls from './GroupPolls';
import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    const navigate = useNavigate();
    let { handle, section, inviterHandle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const [sortBy, setSortBy] = useState('votersYouFollowOrRepresentingYouTimeWeight');

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
        <div className="d-flex align-items-center justify-content-center min-vh-100 mt-n5">
            <DropAnimation />
        </div>
    ) : (
        <>
            <MetaTags
                title={group?.name+' on Liquid Vote'}
                description={group?.bio}
                image={group?.cover}
            />

            <Header title={group?.name} iconType="group" />

            {!!inviterHandle && (
                <TopPageInvite
                    inviterHandle={inviterHandle}
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
                <div className="d-flex flex-column mb-1 mr-1 flex-nowrap flex-1">
                    <h4 className="d-flex white align-items-start m-0">
                        {group?.name}
                        {/* <div className="ml-2">
                            {group?.privacy === "private" ? (
                                <LockSVG />
                            ) : group?.privacy === "public" ? (
                                <WorldSVG />
                            ) : <LinkSVG />}
                        </div> */}
                    </h4>

                    <p className="profile-handle d-flex align-items-center">
                        @{group?.handle}
                        <small>
                            ・ {group?.privacy}

                            {/* {group?.privacy === "private" ? (
                                <LockSVG />
                            ) : group?.privacy === "public" ? (
                                <WorldSVG />
                            ) : <LinkSVG />} */}
                        </small>
                    </p>
                </div>
                <div className="d-flex mb-n1 ml-n1 flex-wrap align-content-start justify-content-end flex-1">
                    <div
                        className="button_ small mb-2 ml-2"
                        onClick={async () => {
                            updateParams({
                                paramsToAdd: {
                                    modal: "InviteFor",
                                    modalData: JSON.stringify({
                                        InviteType: 'toGroup',
                                        groupHandle: group.handle,
                                        groupName: group.name
                                    })
                                }
                            })
                        }}
                    >
                        <InviteTinySvg />
                    </div>
                    <div className='mb-2 ml-2'>
                        <GroupVisibilityPicker
                            group={group}
                        />
                    </div>
                    {(group?.yourStats.representing || group.allowRepresentation) && (
                        <div
                            className={`button_ small mb-2 ml-2 ${group?.yourStats.representing && 'inverted'}`}
                            onClick={() => updateParams({
                                paramsToAdd: {
                                    modal: "ChooseRepresentatives",
                                    modalData: JSON.stringify({
                                        groupHandle: group.handle
                                    })
                                }
                            })}
                        > {group?.yourStats.representing ?
                            `${group?.yourStats.representing} represent you` :
                            'Choose Representatives'
                            }
                        </div>
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
                        ) : null}
                    {/* <div
                        onClick={() => setIsRepresenting(!isRepresenting)}
                        className={`button_ small mb-0 ${isRepresenting ? "selected" : ""}`}
                    >
                        {isRepresenting ? "Represents You" : "Delegate Votes To"}
                    </div> */}
                </div>
            </div>
            <div className="profile-description pre-wrap my-2 white">
                {group?.bio}
            </div>
            <div className="profile-icons-container d-flex">
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
            {
                group?.yourStats && (
                    <>
                        <div className="profile-stats-container flex-nowrap align-items-center">
                            <div className='d-flex'>
                                <div className="mr-1"><ProfileSmallSVG /></div>
                                <div className="d-flex">
                                    <Link className="d-flex mr-2" to={`/group-people/${group?.handle}/members`}>
                                        <b className="white mr-1">{group?.stats?.members || 0}</b> Member{group?.stats?.members !== 1 && 's'}
                                    </Link>
                                </div>
                            </div>
                            {liquidUser ? (
                                <div className='d-flex ml-n2 align-items-center'>
                                    {group.yourStats?.membersYouFollow?.length ? (
                                        <>
                                            {[
                                                ...group.yourStats?.membersYouFollow || []
                                                // TODO: representatives
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
                                                        type="tiny"
                                                    />
                                                </Link>
                                            ))}

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
                                        </>
                                    ) : null}

                                    {!group.yourStats?.membersYouFollow?.length ? (
                                        <small className='mt-n2 faded'>No members you follow</small>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        {(group?.yourStats.representing || group?.yourStats.representedBy) ? (
                            <div className="profile-stats-container flex-nowrap">
                                <div className="mr-1"><HandshakeSVG /></div>
                                <div className="d-flex flex-wrap">
                                    <Link className="mr-2" to={`/group-people/${group?.handle}/representingYou`}>
                                        <b className="white">{group?.yourStats.representing || 0}</b> Representing you
                                    </Link>
                                    <Link to={`/group-people/${group?.handle}/representedByYou`}>
                                        <b className="white">{group?.yourStats.representedBy || 0}</b> Represented by you
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </>
                )
            }
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

            {/* {
                isMember ? (
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
                ) : (
                    <br />
                )
            } */}
            <br />



            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${group?.handle}/polls`}>
                        <b>{group?.stats?.questions}</b>{' '}Polls
                    </Link>
                </li>
                {/* <li className="px-4 mt-1">
                    <VoteSortPicker
                        updateSortInParent={setSortBy}
                        initialSort="votersYouFollowOrRepresentingYouTimeWeight"
                    />
                </li> */}
            </ul>

            {/* <pre style={{ color: 'white' }}>{JSON.stringify(group, null, 2)}</pre> */}

            <hr />

            {
                (!section || section === 'polls') && (
                    <div>
                        <GroupPolls sortBy={sortBy} />

                        {
                            isMember ? (
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
                            ) : (
                                <br />
                            )
                        }

                    </div>
                )
            }

        </>
    );
}

