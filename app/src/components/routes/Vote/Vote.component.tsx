import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { DiscussionEmbed } from 'disqus-react';
import numeral from 'numeral';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';

import VoteGraph1 from "@shared/VoteGraph1";
import Header from "@shared/Header";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import XSVG from "@shared/Icons/X.svg";
import {
    defaults,
    byGroups,
    votesBy,
    onSubTopics
} from "@state/Mock/Votes";
import SubVote from '@shared/SubVote';
import GroupSvg from "@shared/Icons/Group.svg";
import { people } from "@state/Mock/People";
import PersonInList from '@shared/PersonInList';
import { VoteTimeline } from "@state/Mock/Notifications";
import Notification from '@shared/Notification';

export default function Vote() {

    let { voteName, section } = useParams<any>();

    const [userVote, setUserVote] = useState(null);
    const [isPollingInOtherGroup, setIsPollingInOtherGroup] = useState(false);
    const [isShowingVotersModal, setIsShowingVotersModal] = useState(false);
    const [usersShowing, setUsersShowing] = useState('');
    const [selectedGroups, setSelectedGroups] = useState(['Algarve Flats']);

    const selectGroup = (group: string) => {
        if (selectedGroups.indexOf(group) !== -1) {
            setSelectedGroups(selectedGroups.filter((el, i) => i !== selectedGroups.indexOf(group)))
        } else {
            setSelectedGroups([...selectedGroups, group])
        }
    }

    const openStats = (for_: any) => {
        alert(`TODO: open stats for ${for_}`);
    };

    const handleUserVote = (vote: string) => {
        if (vote === userVote) {
            setUserVote(null)
        } else {
            setUserVote(vote);
        }
    }

    const stats = (({ forCount, againstCount, forDirectCount, againstDirectCount }) => {
        const forPercentage = (!forCount && !againstCount) ? 50 : ((forCount / (forCount + againstCount)) * 100);
        const forDirectPercentage = (forDirectCount / (forCount + againstCount)) * 100 || 50;
        const forDelegatedPercentage = ((forCount - forDirectCount) / (forCount + againstCount)) * 100;
        const againstPercentage = 100 - forPercentage;
        const againstDirectPercentage = (againstDirectCount / (forCount + againstCount)) * 100 || 50;
        const againstDelegatedPercentage = ((againstCount - againstDirectCount) / (forCount + againstCount)) * 100;

        return {
            forDelegatedPercentage,
            forDirectPercentage,
            againstDelegatedPercentage,
            againstDirectPercentage
        }
    })({
        forCount: defaults.forCount,
        againstCount: defaults.againstCount,
        forDirectCount: defaults.forDirectCount,
        againstDirectCount: defaults.againstDirectCount,
    })

    return (
        <>
            <ReactTooltip place="bottom" type="dark" effect="solid" />
            <Modal
                isOpen={isPollingInOtherGroup}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => setIsPollingInOtherGroup(false)}
                // style={customStyles}
                contentLabel="Example Modal"
                className="Modal"
                overlayClassName="Overlay"
            >
                <div className="d-flex align-items-center mb-n2">
                    <div onClick={() => setIsPollingInOtherGroup(false)} role="button">
                        <XSVG />
                    </div>
                </div>

                <hr />
                <div>Todo: List Groups here</div>
            </Modal>
            <Modal
                isOpen={isShowingVotersModal}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => setIsShowingVotersModal(false)}
                // style={customStyles}
                contentLabel="Example Modal"
                className="Modal"
                overlayClassName="Overlay"
            >
                <div className="d-flex align-items-center mb-n2">
                    <div onClick={() => setIsShowingVotersModal(false)} role="button">
                        <XSVG />
                    </div>
                    <h4 className="ml-4 mb-0">{usersShowing}</h4>
                </div>

                <hr className="mb-0" />

                <div className="mt-n2">
                    {people.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                </div>

                {/* <CreateVote group={groupName} /> */}

            </Modal>


            <Header title="Opinion Poll" />

            <h2 className="mb-0 mt-4">Do you approve</h2>
            <h2 className="mb-2 white"><b>{voteName}</b>?</h2>

            <div>
                {/* <h4 onClick={() => openStats("Vote")}>Opinions</h4> */}
                <div className="bar-wrapper">
                    <VoteGraph1 {...defaults} />
                </div>

                <div className="d-flex color-legend mt-2 mb-n2">
                    <div>
                        <small>Direct For</small><div className="color forDirect count">{stats.forDirectPercentage.toFixed(0)}%</div>
                    </div>
                    <div>
                        <small>Delegated For</small><div className="color for count">{stats.forDelegatedPercentage.toFixed(0)}%</div>
                    </div>
                    <div>
                        <small>Direct Against</small><div className="color againstDirect count">{stats.againstDirectPercentage.toFixed(0)}%</div>
                    </div>
                    <div>
                        <small>Delegated Against</small><div className="color against count">{stats.againstDelegatedPercentage.toFixed(0)}%</div>
                    </div>
                </div>

                <div className="d-flex d-flex justify-content-between mt-4">
                    <div className="d-flex align-items-center">
                        <div
                            className={`button_ ${userVote === 'for' && 'selected'}`}
                        >
                            <span onClick={() => handleUserVote('for')}>
                                For
                            </span>
                            <div className="d-flex ml-3 my-n2 mr-n1">
                                <Link to="/profile" className="vote-avatar avatar-1 for ml-n2 d-none d-md-block"></Link>
                                <div onClick={(e) => {
                                    setIsShowingVotersModal(true);
                                    setUsersShowing(`Your Representatives Voting For on ${voteName}`);
                                }} className="vote-avatar count for ml-n2">+{3}</div>
                            </div>
                        </div>
                        <div className="d-flex ml-2">
                            {/* <Link to="/profile" className="vote-avatar avatar-1 for ml-n2"></Link> */}
                            <Link to="/profile" className="vote-avatar avatar-2 for ml-n2 d-none d-md-block"></Link>
                            <Link to="/profile" className="vote-avatar avatar-3 for ml-n2 d-none d-md-block"></Link>
                            <div onClick={(e) => {
                                setIsShowingVotersModal(true);
                                setUsersShowing(`People Voting For on ${voteName}`);
                            }} className="vote-avatar count for ml-n2">{numeral(defaults.forCount).format('0a')}</div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="d-flex ml-2">
                            <Link to="/profile" className="vote-avatar avatar-4 against ml-n2 d-none d-md-block"></Link>
                            {/* <Link to="/profile" className="vote-avatar avatar-5 against ml-n2 d-none d-md-block"></Link> */}
                            <Link to="/profile" className="vote-avatar avatar-6 against ml-n2 d-none d-md-block"></Link>
                            {/* <div className="vote-avatar avatar-1 ml-n2" /> */}
                            <div onClick={(e) => {
                                setIsShowingVotersModal(true);
                                setUsersShowing(`People Voting Against on ${voteName}`);
                            }} className="vote-avatar count against ml-n2">{numeral(defaults.againstCount).format('0a')}</div>
                        </div>
                        <div
                            className={`button_ ${userVote === 'against' && 'selected'}`}
                        >
                            <span onClick={() => handleUserVote('against')}>
                                Against
                            </span>
                            <div className="d-flex ml-3 my-n2 mr-n1">
                                <Link to="/profile" className="vote-avatar avatar-5 against ml-n2 d-none d-md-block"></Link>
                                <div onClick={(e) => {
                                    setIsShowingVotersModal(true);
                                    setUsersShowing(`Your Representatives Voting Against on ${voteName}`);
                                }} className="vote-avatar count against ml-n2">+{1}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 d-flex align-items-start flex-nowrap justify-content-between">
                    <div className="d-flex flex-nowrap">
                        <div data-tip="Selected groups"><GroupSvg /></div>
                        <div className="d-flex flex-wrap justify-content-start">
                            <div className="badge inverted ml-1 mb-1 mt-1">All</div>
                            <div onClick={() => selectGroup('Algarve Flats')} className={`badge ${selectedGroups.indexOf('Algarve Flats') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>Algarve Flats</div>
                            <div onClick={() => selectGroup('Moon Investors')} className={`badge ${selectedGroups.indexOf('Moon Investors') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>Moon Investors</div>
                            <div onClick={() => selectGroup('💩s')} className={`badge ${selectedGroups.indexOf('💩s') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>💩s</div>
                            <div onClick={() => selectGroup('Shoreditch Neighborhood')} className={`badge ${selectedGroups.indexOf('Shoreditch Neighborhood') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>Shoreditch Neighborhood</div>
                            {/*
                            <div onClick={() => selectGroup('Moon Investors')} className={`badge ${selectedGroups.indexOf('Moon Investors') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>Moon Investors</div>
                            <div onClick={() => selectGroup('Moon Investors')} className={`badge ${selectedGroups.indexOf('Moon Investors') === -1 && 'inverted'} ml-1 mb-1 mt-1`}>Moon Investors</div>
                            */}
                            <div className={`badge inverted ml-1 mb-1 mt-1`}>+3</div>
                        </div>
                    </div>
                    <div onClick={() => setIsPollingInOtherGroup(true)} className="button_ small mb-0 mw-25">
                        poll this in another group
                    </div>
                </div>

                <br />

                <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                    <li className="nav-item">
                        <Link className={`nav-link ${(!section || section === 'timeline') && 'active'}`} to={`/poll/${voteName}/timeline`}>
                            Timeline
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${(section === 'subpolls') && 'active'}`} to={`/poll/${voteName}/subpolls`}>
                            <b>18</b> Sub Polls
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${section === 'votesby' && 'active'}`} to={`/poll/${voteName}/votesby`}>
                            Votes by
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${section === 'conversation' && 'active'}`} to={`/poll/${voteName}/conversation`}>
                            Conversation
                        </Link>
                    </li>
                </ul>

                <br />
                <br />

                {/* <h3>Sub polls</h3> */}
                {section === 'subpolls' && (
                    <div className="bar-container-horizontal">
                        {onSubTopics.map((l, i) => (
                            <SubVote
                                l={{ ...l, name: voteName }}
                                i={i}
                            />
                        ))}
                        <div className="d-flex justify-content-center mt-3" data-tip="Create Sub Poll">
                            <Link to="#" onClick={() => alert("allows anyone to create a sub poll")} className="button_ icon-contain inverted">
                                <DropPlusSVG />
                            </Link>
                        </div>
                    </div>
                )}


                {(section === 'votesby') && (
                    <div>
                        <h5 onClick={() => openStats("Sub Groups")}>Sub Groups</h5>
                        <div className="bar-container">
                            {byGroups.yourGroup.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="SubGroups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Your Representatives")}>Your Representatives</h4>
                        <div className="bar-container">
                            {byGroups.yourRepresentatives.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="YourRepresentatives" />
                                </div>
                            ))}
                        </div>

                        {/* <br />
                        <h4 onClick={() => openStats("People you Follow")}>People you Follow</h4>
                        <div className="bar-container">
                            {byGroups.yourRepresentatives.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="YourFollowees" />
                                </div>
                            ))}
                        </div> */}

                        {/* <br />
                        <h4 onClick={() => openStats("Location")}>Locations</h4>
                        <div className="bar-container">
                            {byGroups.location.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="Location" />
                                </div>
                            ))}
                        </div> */}

                        <br />
                        <h4 onClick={() => openStats("Age Groups")}>Age Groups</h4>
                        <div className="bar-container">
                            {byGroups.age.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="Age Groups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Location")}>Occupations</h4>
                        <div className="bar-container">
                            {byGroups.occupation.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} />
                                </div>
                            ))}
                        </div>


                        <br />
                        <h4 onClick={() => openStats("Approval on other topics")}>
                            Correlations with other Votes 🧪
                        </h4>
                        <div className="bar-container">
                            {byGroups.approvalOnOtherTopics.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`b-${i}`} {...l} />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Votes By")}>Voters</h4>
                        <div className="bar-container">
                            {votesBy.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`c-${i}`} {...l} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!section || section === 'timeline') && VoteTimeline.map((l, i) => (
                    <Notification v={{ ...l, poll: null }} showChart={false} />
                ))}


                {(section === 'conversation') && (
                    <DiscussionEmbed
                        shortname='enronavoider'
                        config={
                            {
                                url: `http://localhost:8080/`,
                                identifier: `http://localhost:8080/`,
                                title: 'test',
                            }
                        }
                    ></DiscussionEmbed>
                )}

            </div>

        </>
    );
}
