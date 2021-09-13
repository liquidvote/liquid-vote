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
import { GROUP } from "@state/Group/typeDefs";
import { timeAgo } from '@state/TimeAgo';
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";

import GroupPolls from './GroupPolls';
import GroupVotes from './GroupVotes';
import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    let { handle, section } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const [sortBy, setSortBy] = useState('representing');

    const {
        loading: group_loading,
        error: group_error,
        data: group_data,
        refetch: group_refetch
    } = useQuery(GROUP, {
        variables: { handle }
    });

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

    const selectedGroup = group_data?.Group;

    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    useEffect(() => {
        if (!!selectedGroup?.yourMemberRelation?.channels) {
            setSelectedChannels(
                selectedGroup?.yourMemberRelation?.channels
            );
        } else {
            setSelectedChannels(
                selectedGroup?.channels?.map((s: any) => s.name) || []
            );
        }
    }, [selectedGroup]);

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [group_loading]);

    const isMember =
        !!liquidUser && (
            selectedGroup?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember
        );

    return !selectedGroup ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : group_error ? (<>Error</>) : (
        <>
            <Header title={selectedGroup?.name} iconType="group" />

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: selectedGroup?.cover && `url(${selectedGroup?.cover}) 50% 50% no-repeat`,
                        backgroundSize: 'cover'
                    }}
                />
            </div>
            <div className="d-flex flex-wrap mt-2 justify-content-between">
                <div className="d-flex flex-column mb-1">
                    <h4 className="d-flex align-items-center m-0">
                        {selectedGroup?.name}
                        <div className="ml-2 mt-n1">
                            {selectedGroup?.privacy === "private" ? (
                                <LockSVG />
                            ) : (
                                <WorldSVG />
                            )}
                        </div>
                    </h4>
                    <p className="profile-handle">@{selectedGroup?.handle}</p>
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
                                            groupHandle: selectedGroup.handle,
                                            groupName: selectedGroup.name
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
                                            groupHandle: selectedGroup.handle,
                                            groupName: selectedGroup.name
                                        })
                                    }
                                })}
                            >
                                Invite Members
                            </div>
                        </>
                    )}
                    {
                        selectedGroup?.thisUserIsAdmin ? (
                            <div
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "EditGroup",
                                        modalData: JSON.stringify({ groupHandle: selectedGroup?.handle })
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
                                        GroupHandle: selectedGroup?.handle,
                                        IsMember: !isMember
                                    }
                                }) : updateParams({
                                    paramsToAdd: {
                                        modal: "RegisterBefore",
                                        modalData: JSON.stringify({
                                            toWhat: 'joinGroup',
                                            groupHandle: selectedGroup.handle,
                                            groupName: selectedGroup.name
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
                {selectedGroup?.bio}
            </div>
            <div className="profile-icons-container d-flex">
                {/* <div>
                    <LocationSVG />
                    <div>{selectedGroup?.bio}</div>
                </div> */}
                {selectedGroup?.externalLink && (
                    <div>
                        <div className="mr-1"><LinkSVG /></div>
                        <a
                            href={`//${selectedGroup?.externalLink}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {selectedGroup?.externalLink}
                        </a>
                    </div>
                )}
                <div>
                    <div className="mr-1"><CalendarSVG /></div>
                    <div>Group created {timeAgo.format(new Date(Number(selectedGroup?.createdOn)))}</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link className="mr-2" to={`/group-people/${selectedGroup?.handle}/members`}>
                    <b>{selectedGroup?.stats?.members || 0}</b> Member{selectedGroup?.members !== 1 && 's'}
                </Link>
                {
                    selectedGroup?.yourStats && (
                        <>
                            <Link className="mr-2" to={`/group-people/${selectedGroup?.handle}/representingYou`}>
                                <b>{selectedGroup?.yourStats.representing || 0}</b> Representing you
                            </Link>
                            <Link to={`/group-people/${selectedGroup?.handle}/representedByYou`}>
                                <b>{selectedGroup?.yourStats.representedBy || 0}</b> Represented by you
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
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${selectedGroup?.handle}/polls`}>
                        <b>{selectedGroup?.stats?.questions}</b>{' '}Polls
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'votes' && 'active'}`} to={`/group/${selectedGroup?.handle}/votes`}>
                        <b>{selectedGroup?.stats?.directVotesMade}</b>{' '}
                        Votes
                    </Link>
                </li>
                <li className="px-4 mt-1">
                    <VoteSortPicker updateSortInParent={setSortBy} />
                </li>
            </ul>

            {/* <pre style={{ color: 'white' }}>{JSON.stringify(selectedGroup, null, 2)}</pre> */}

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

