import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { useMutation, useQuery } from "@apollo/client";

import DropAnimation from '@components/shared/DropAnimation';
import VoteSortPicker from '@components/shared/VoteSortPicker';
import Header from "@shared/Header";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import LinkSVG from "@shared/Icons/Link.svg";
import LockSVG from "@shared/Icons/Lock.svg";
import WorldSVG from "@shared/Icons/World.svg";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";
import useGroup from '@state/Group/group.effect';
import { timeAgo } from '@state/TimeAgo';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";

import GroupPolls from './GroupPolls';
import GroupVotes from './GroupVotes';
import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    let { handle, section } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const [sortBy, setSortBy] = useState('representing');

    const { group, group_refetch } = useGroup({ handle });

    const [editGroupMemberChannelRelation, {
        loading: editGroupMemberChannelRelation_loading,
        error: editGroupMemberChannelRelation_error,
        data: editGroupMemberChannelRelation_data,
    }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION);

    const { liquidUser } = useAuthUser();

    useEffect(() => {
        if (allSearchParams.refetch === 'group') {
            group_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    // const group = group_data?.Group;

    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    useEffect(() => {
        if (!!group?.yourMemberRelation?.channels) {
            setSelectedChannels(
                group?.yourMemberRelation?.channels
            );
        } else {
            setSelectedChannels(
                group?.channels?.map((s: any) => s.name) || []
            );
        }
    }, [group]);

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [group]);

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

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: group?.cover && `url(${group?.cover}) 50% 50% no-repeat`,
                        backgroundSize: 'cover'
                    }}
                />
            </div>
            <div className="d-flex flex-wrap mt-2 justify-content-between">
                <div className="d-flex flex-column mb-1">
                    <h4 className="d-flex align-items-center m-0">
                        {group?.name}
                        <div className="ml-2 mt-n1">
                            {group?.privacy === "private" ? (
                                <LockSVG />
                            ) : (
                                <WorldSVG />
                            )}
                        </div>
                    </h4>
                    <p className="profile-handle">@{group?.handle}</p>
                </div>
                <div className="d-flex mb-1 ml-n1">
                    {isMember && (
                        <>
                            {/* <div
                                className="button_ small mb-0"
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "InviteFor",
                                        modalData: JSON.stringify({
                                            InviteType: 'representation',
                                            groupHandle: group.handle,
                                            groupName: group.name
                                        })
                                    }
                                })}
                            >
                                Invite Representees
                            </div> */}
                            <div
                                className="button_ small mb-0 ml-2"
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "InviteFor",
                                        modalData: JSON.stringify({
                                            InviteType: 'toGroup',
                                            groupHandle: group.handle,
                                            groupName: group.name
                                        })
                                    }
                                })}
                            >
                                Invite Members
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
                                className={`button_ small ml-2 mb-0`}
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
            <div className="profile-icons-container d-flex">
                {/* <div>
                    <LocationSVG />
                    <div>{group?.bio}</div>
                </div> */}
                {group?.externalLink && (
                    <div>
                        <div className="mr-1"><LinkSVG /></div>
                        <a
                            href={`//${group?.externalLink}`}
                            target="_blank"
                            rel="noreferrer"
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
            <div className="profile-stats-container">
                <Link className="mr-2" to={`/group-people/${group?.handle}/members`}>
                    <b>{group?.stats?.members || 0}</b> Member{group?.members !== 1 && 's'}
                </Link>
                {
                    group?.yourStats && (
                        <>
                            <Link className="mr-2" to={`/group-people/${group?.handle}/representingYou`}>
                                <b>{group?.yourStats.representing || 0}</b> Representing you
                            </Link>
                            <Link to={`/group-people/${group?.handle}/representedByYou`}>
                                <b>{group?.yourStats.representedBy || 0}</b> Represented by you
                            </Link>
                        </>
                    )
                }
            </div>

            {isMember && (
                <div
                    onClick={() => updateParams({
                        paramsToAdd: {
                            modal: "EditQuestion",
                            modalData: JSON.stringify({
                                questionHandle: 'new',
                                groupHandle: handle,
                            })
                        }
                    })}
                    className="button_ mx-5 my-3 mb-4"
                >
                    <DropPlusSVG />
                    <div className="ml-2">Create a new Poll</div>
                </div>
            )}


            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${group?.handle}/polls`}>
                        <b>{group?.stats?.questions}</b>{' '}Polls
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'votes' && 'active'}`} to={`/group/${group?.handle}/votes`}>
                        <b>{group?.stats?.directVotesMade}</b>{' '}
                        Votes
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>

            {/* <pre style={{ color: 'white' }}>{JSON.stringify(group, null, 2)}</pre> */}

            <hr />

            {(!section || section === 'polls') && (
                <div>
                    <GroupPolls sortBy={sortBy} />
                </div>
            )}
            {(section === 'votes') && (
                <GroupVotes sortBy={sortBy} />
            )}

        </>
    );
}

