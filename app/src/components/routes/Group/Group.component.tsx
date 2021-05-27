import React, { FunctionComponent, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Modal from 'react-modal';
import numeral from 'numeral';

import VoteGraph1 from "@shared/VoteGraph1";
import Header from "@shared/Header";
import LinkSVG from "@shared/Icons/Link.svg";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import MultiDrop from "@shared/Icons/MultiDrop.svg";
import XSVG from "@shared/Icons/X.svg";
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
import GroupSvg from "@shared/Icons/Group.svg";
import MultiVoteInList from "@shared/MultiVoteInList";

import './style.sass';

export const Group: FunctionComponent<{}> = ({ }) => {

    let { groupName, section } = useParams<any>();

    const selectedGroup = groups.find((g) => g.name === groupName) || groups[0];

    console.log({ selectedGroup });

    const [isRepresenting, setIsRepresenting] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);
    const [selectedSubGroups, setSelectedSubGroups] = useState(selectedGroup.subGroups?.map(s => s.name));

    const selectGroup = (group: string) => {
        if (selectedSubGroups.indexOf(group) !== -1) {
            setSelectedSubGroups(selectedSubGroups?.filter((el, i) => i !== selectedSubGroups.indexOf(group)))
        } else {
            setSelectedSubGroups([...selectedSubGroups, group])
        }
    }

    const selectAllGroups = () => {
        // TODO
        if (selectedSubGroups.length === selectedGroup.subGroups.length) {
            setSelectedSubGroups([]);
        } else {
            setSelectedSubGroups(selectedGroup.subGroups?.map(s => s.name));
        }
    }

    return (
        <>
            <Header title={groupName} />
            <Modal
                isOpen={isCreatingPoll}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => setIsCreatingPoll(false)}
                // style={customStyles}
                contentLabel="Example Modal"
                className="Modal"
                overlayClassName="Overlay"
            >
                <div className="d-flex align-items-center mb-n2">
                    <div onClick={() => setIsCreatingPoll(false)} role="button">
                        <XSVG />
                    </div>
                    <h4 className="ml-4 mb-0">Create Poll</h4>
                </div>

                <hr className="mb-0" />

                <CreateVote group={groupName} />

            </Modal>

            <div className="profile-top">
                <div className="cover" />
                {/* <div className="profile-avatar bg"></div> */}
                {/* <div className="profile-buttons-container">
                    <div className="button_ small">
                        Invite
                    </div>
                    <div
                        onClick={() => setIsJoined(!isJoined)}
                        className={`button_ small ${isJoined ? "selected" : ""}`}
                    >
                        {isJoined ? "Joined" : "Ask to Join"}
                    </div>
                    <div
                        onClick={() => setIsRepresenting(!isRepresenting)}
                        className={`button_ small ${isRepresenting ? "selected" : ""}`}
                    >
                        {isRepresenting ? "Represents You" : "Delegate Votes To"}
                    </div>
                </div> */}
            </div>
            <div className="d-flex flex-wrap mt-2 justify-content-between">
                <div className="d-flex flex-column mb-1">
                    <h4 className="d-flex align-items-center m-0">
                        {groupName}
                        <div className="ml-2 mt-n1">
                            {defaults.private ? (
                                <LockSVG />
                            ) : (
                                <WorldSVG />
                            )}
                        </div>
                    </h4>
                    <p className="profile-handle">@{groupName.replace(" ", "")}</p>
                </div>
                <div className="d-flex mb-1 ml-n1">
                    <div className="button_ small mb-0">
                        Invite
                    </div>
                    <div
                        onClick={() => setIsJoined(!isJoined)}
                        className={`button_ small mb-0 ${isJoined ? "selected" : ""}`}
                    >
                        {isJoined ? "Joined" : "Ask to Join"}
                    </div>
                    {/* <div
                        onClick={() => setIsRepresenting(!isRepresenting)}
                        className={`button_ small mb-0 ${isRepresenting ? "selected" : ""}`}
                    >
                        {isRepresenting ? "Represents You" : "Delegate Votes To"}
                    </div> */}
                </div>
            </div>
            {/* <p className="profile-handle">@{groupName.replace(" ", "")}</p> */}
            <div className="profile-description">
                Projecto de Eco-Aldeia no Freguesia da Abrigada
            </div>
            <div className="profile-icons-container d-flex">
                <div>
                    <LocationSVG />
                    <div>Alenquer, Portugal</div>
                </div>
                <div>
                    <LinkSVG />
                    <a
                        href="#"
                    // target="_blank"
                    // rel="noreferrer"
                    >
                        instagram.com/{groupName}
                    </a>
                </div>
                <div>
                    <CalendarSVG />
                    <div>Started November 2013</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link to={`/group-people/${groupName}`}>
                    <b>327</b> Members
                </Link>
                {/* <Link to={`/group/${groupName}/subgroups`} className="ml-2">
                    <b>16</b> Sub Groups
                </Link> */}
            </div>

            <div className="mt-4 mb-3 d-flex align-items-start flex-nowrap justify-content-between">
                <div className="d-flex flex-column">
                    <div data-tip="Selected groups">
                        {/* <GroupSvg />  */}
                        <b>{selectedGroup.subGroups?.length || 0}</b> Sub Groups
                    </div>
                    <div className="d-flex flex-wrap justify-content-start ml-n1">
                        <div
                            className={`badge ${selectedSubGroups?.length === selectedGroup.subGroups?.length ? '' : 'inverted'} ml-1 mb-1 mt-1`}
                            onClick={() => selectAllGroups()}
                        >All</div>
                        {selectedGroup.subGroups?.map((el) => (
                            <div onClick={() => selectGroup(el.name)} className={`badge ${selectedSubGroups.indexOf(el.name) === -1 && 'inverted'} ml-1 mb-1 mt-1`}>{el.name}</div>
                        ))}
                        {/* <div className={`badge inverted ml-1 mb-1 mt-1`}>+3</div> */}
                    </div>
                </div>
                {/* <div onClick={() => setIsPollingInOtherGroup(true)} className="button_ small mb-0 mw-25">
                    poll this in another group
                </div> */}
            </div>

            <div onClick={() => setIsCreatingPoll(true)} className="button_ mx-5 my-3">
                <DropPlusSVG />
                <div className="ml-2">Create New Poll</div>
            </div>

            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'polls') && 'active'}`} to={`/group/${groupName}/polls`}>
                        <b>{selectedGroup?.votes?.length}</b> Polls
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'timeline' && 'active'}`} to={`/group/${groupName}/timeline`}>
                        Timeline
                    </Link>
                </li>
            </ul>

            <hr />

            { (!section || section === 'polls') && (
                <div>

                    {selectedGroup?.votes?.filter(
                        v => v.subgroups.reduce(
                            (acc, sg) => selectedSubGroups.includes(sg) || acc,
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
                    }

                    {/* <div>
                        {profileVotes.map((l, i) => (
                            <>
                                <VoteWrapper l={l} />
                                <hr />
                            </>
                        ))}
                    </div> */}
                </div>
            )}
            { section === 'members' && (
                <div className="mt-n2">
                    {people.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                </div>
            )}
            { section === 'subgroups' && (
                <div className="mt-n2">
                    {selectedGroup.subGroups?.map((el, i) => (
                        <GroupInList group={el} />
                    ))}
                </div>
            )}
            {(section === 'timeline') && VoteTimeline.map((l, i) => (
                <Notification v={{ ...l }} showChart={true} />
            ))}

        </>
    );
}

