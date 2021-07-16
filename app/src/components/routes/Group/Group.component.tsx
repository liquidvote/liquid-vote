import React, { FunctionComponent, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from "@apollo/client";
import ReactTooltip from 'react-tooltip';

// import VoteGraph1 from "@shared/VoteGraph1";
import Header from "@shared/Header";
import LinkSVG from "@shared/Icons/Link.svg";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import { profileVotes, byGroups, valores } from "@state/Mock/Votes";
import { people } from "@state/Mock/People";
import { defaults, groups, subGroups } from "@state/Mock/Groups";
import VoteWrapper from "@shared/VoteWrapper";
import LockSVG from "@shared/Icons/Lock.svg";
import WorldSVG from "@shared/Icons/World.svg";
import WorldlockSVG from "@shared/Icons/Worldlock.svg";
import PersonInList from '@shared/PersonInList'
import GroupInList from "@shared/GroupInList";
import CreateVote from "@shared/CreateVote";
import { VoteTimeline } from "@state/Mock/Notifications";
import Notification from '@shared/Notification';
import GroupSmallSvg from "@shared/Icons/Group-small.svg";
import MultiVoteInList from "@shared/MultiVoteInList";
import { GROUP, EDIT_GROUP } from "@state/Group/typeDefs";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";
import GroupPolls from './GroupPolls';
import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    let { handle, section } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

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

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authUser = authUser_data?.authUser;

    useEffect(() => {
        if (allSearchParams.refetch === 'group') {
            group_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    const selectedGroup = group_data?.Group;

    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    const selectChannel = async (channel: string) => {

        const updatedSelectedChannels = [
            ...(selectedChannels.indexOf(channel) !== -1) ? selectedChannels?.filter(
                (el: any, i: number) => i !== selectedChannels.indexOf(channel)
            ) : [...selectedChannels, channel],
        ]

        setSelectedChannels(updatedSelectedChannels);
        saveSetSelectedChannels({ updatedSelectedChannels });
    }

    const selectAllChannels = () => {

        const updatedSelectedChannels = [
            ...(selectedChannels.length === selectedGroup.channels.length) ?
                [] :
                selectedGroup?.channels?.map((s: any) => s.name)
        ]

        setSelectedChannels(updatedSelectedChannels);
        saveSetSelectedChannels({ updatedSelectedChannels });
    }

    const saveSetSelectedChannels = (
        { updatedSelectedChannels }:
            { updatedSelectedChannels: any }
    ) => {
        if (authUser?.LiquidUser) {
            editGroupMemberChannelRelation({
                variables: {
                    UserHandle: authUser.LiquidUser.handle,
                    GroupHandle: selectedGroup.handle,
                    Channels: updatedSelectedChannels,
                }
            });
        }
    }

    useEffect(() => {
        console.log({
            c: selectedGroup?.yourMemberRelation,
            is: !!selectedGroup?.yourMemberRelation?.channels
        });

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
        !!authUser && (
            selectedGroup?.yourMemberRelation?.isMember ||
            editGroupMemberChannelRelation_data?.editGroupMemberChannelRelation?.isMember
        );

    return group_loading ? (<>Loading</>) : group_error ? (<>Error</>) : (
        <>
            <Header title={selectedGroup?.name} />

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: selectedGroup?.cover && `url(${selectedGroup?.cover}) no-repeat`,
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
                    <div className="button_ small mb-0">
                        Invite
                    </div>
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
                                onClick={() => editGroupMemberChannelRelation({
                                    variables: {
                                        UserHandle: authUser?.LiquidUser?.handle,
                                        GroupHandle: selectedGroup?.handle,
                                        IsMember: !isMember
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
            <div className="profile-description">
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
                            href={selectedGroup?.externalLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {selectedGroup?.externalLink}
                        </a>
                    </div>
                )}
                <div>
                    <div className="mr-1"><CalendarSVG /></div>
                    <div>Joined {selectedGroup?.createdOn}</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link to={`/group-people/${selectedGroup?.handle}/members`}>
                    <b>{selectedGroup?.stats?.members || 0}</b> Member{selectedGroup?.members !== 1 && 's'}
                </Link>
                {
                    selectedGroup?.yourStats && (
                        <>
                            <Link className="ml-2" to={`/group-people/${selectedGroup?.handle}/representingYou`}>
                                <b>{selectedGroup?.yourStats.representing || 0}</b> Representing you
                            </Link>
                            <Link className="ml-2" to={`/group-people/${selectedGroup?.handle}/representedByYou`}>
                                <b>{selectedGroup?.yourStats.representedBy || 0}</b> Represented by you
                            </Link>
                        </>
                    )
                }
                {/* <Link to={`/group/${groupName}/subgroups`} className="ml-2">
                    <b>16</b> Sub Groups
                </Link> */}
            </div>
            
            <div className="mt-4 mb-3 d-flex align-items-start flex-nowrap justify-content-between">
                <div className="d-flex flex-column">
                    {/* <div data-tip="Selected channels">
                        <GroupSmallSvg />
                        <b className="ml-1">{selectedGroup.channels?.length || 0}</b> Channels
                    </div> */}
                    <div
                        className="d-flex flex-wrap justify-content-start"
                    >
                        <div data-tip="Selected channels">
                            <GroupSmallSvg />
                        </div>
                        <div
                            className={`ml-1 badge pointer ${selectedChannels?.length === selectedGroup.channels?.length ? '' : 'inverted'} ml-1 mb-1 mt-1`}
                            onClick={() => selectAllChannels()}
                        >All</div>
                        {selectedGroup?.channels?.map((el: any, i: any) => (
                            <div
                                key={'s-' + el.name}
                                onClick={() => selectChannel(el.name)}
                                className={`badge pointer ${selectedChannels.indexOf(el.name) === -1 && 'inverted'} ml-1 mb-1 mt-1`}
                            >{el.name}</div>
                        ))}
                        {/* <div className={`badge inverted ml-1 mb-1 mt-1`}>+3</div> */}
                    </div>
                </div>
            </div>

            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${selectedGroup?.handle}/polls`}>
                        <b>{selectedGroup?.votes?.length}</b> Polls
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'timeline' && 'active'}`} to={`/group/${selectedGroup?.handle}/timeline`}>
                        Timeline
                    </Link>
                </li>
            </ul>

            <hr />

            {(!section || section === 'polls') && (
                <div>
                    <GroupPolls selectedChannels={selectedChannels} />

                    {/* {selectedGroup?.votes?.filter(
                        v => v.subgroups.reduce(
                            (acc, sg) => selectedChannels.includes(sg) || acc,
                            false
                        )
                    )
                        .map((v, i) => (
                            <>
                                {v.type === 'multi' && (
                                    <MultiVoteInList v={v} i={i} />
                                )}
                                {v.type === 'single' && (
                                    <VoteWrapper l={v} showGroup={true} showIntroMessage={true} />
                                )}
                                <hr />
                            </>
                        ))
                    } */}
                </div>
            )}
            {/* {section === 'members' && (
                <div className="mt-n2">
                    {people.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                </div>
            )}
            {section === 'subgroups' && (
                <div className="mt-n2">
                    {selectedGroup.subGroups?.map((el, i) => (
                        <GroupInList group={el} />
                    ))}
                </div>
            )} */}
            {(section === 'timeline') && VoteTimeline.map((l, i) => (
                <Notification v={{ ...l }} showChart={true} />
            ))}

        </>
    );
}

