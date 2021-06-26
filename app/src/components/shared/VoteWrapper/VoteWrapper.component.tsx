import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import Modal from 'react-modal';

import VoteGraph1 from "@shared/VoteGraph1";
import XSVG from "@shared/Icons/X.svg";
import { people } from "@state/Mock/People";
import PersonInList from '@shared/PersonInList';

import './style.sass';

export const VoteWrapper: FunctionComponent<{
    l: any, introMessage?: string, showIntroMessage?: boolean, showColorLegend?: boolean, showGroup?: boolean
}> = ({
    l, introMessage, showIntroMessage, showColorLegend, showGroup
}) => {

        const [userVote, setUserVote] = React.useState(null);
        const handleUserVote = (vote: string) => {
            if (vote === userVote) {
                setUserVote(null)
            } else {
                setUserVote(vote);
            }
        }

        const [isShowingVotersModal, setIsShowingVotersModal] = useState(false);
        const [usersShowing, setUsersShowing] = useState('');


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
            forCount: l.forCount,
            againstCount: l.againstCount,
            forDirectCount: l.forDirectCount,
            againstDirectCount: l.againstDirectCount,
        })

        return (
            <div className="position-relative">
                {l.questionText && (
                    <small className="time-ago" data-tip="Last vote was">
                        12s
                    </small>
                )}
                <div>
                    {showIntroMessage && (
                        <small className="do-you d-flex mb-n1">{introMessage || 'Do you approve'}</small>
                    )}
                    <div className="bar-wrapper mb-1">
                        {!!l.questionText && (
                            <a className="white mb-0 d-flex align-items-center" href={`/poll/${l.questionText}`}>
                                <div className="text-truncate" title={l.questionText}>
                                    {l.questionText}
                                    {showIntroMessage && '?'}
                                </div>
                                {!!showGroup && (
                                    <div className="badge m-0 ml-2">{l.groupChannel.group}: {l.groupChannel.channel}</div>
                                )}
                            </a>
                        )}
                        <VoteGraph1 key={`d-${l.questionText}`} {...l} name="" />
                    </div>

                    {showColorLegend && (
                        <div className="d-flex color-legend mt-0 mb-4">
                            <div>
                                <small className="px-1">Direct For</small><div className="color forDirect count">{stats.forDirectPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Delegated For</small><div className="color for count">{stats.forDelegatedPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Direct Against</small><div className="color againstDirect count">{stats.againstDirectPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Delegated Against</small><div className="color against count">{stats.againstDelegatedPercentage.toFixed(0)}%</div>
                            </div>
                        </div>

                    )}

                    <div className="d-flex d-flex justify-content-between">
                        <div className="d-flex align-items-center small-for-against-buttons-container">
                            <div
                                className={`button_ small ${userVote === 'for' && 'selected'}`}
                            >
                                <span onClick={() => handleUserVote('for')}>
                                    For
                                </span>
                                <div className="d-flex ml-3 my-n2 mr-n1">
                                    <Link to="/profile" className="vote-avatar tiny avatar-1 for ml-n2 d-none d-md-block"></Link>
                                    <div onClick={() => {
                                        setIsShowingVotersModal(true);
                                        setUsersShowing(`Your Representatives Voting For on ${l.questionText}`);
                                    }} className="vote-avatar tiny count for ml-n2">+{3}</div>
                                </div>
                            </div>
                            <div className="d-flex ml-2">
                                {/* <Link to="/profile" className="vote-avatar tiny avatar-1 for ml-n2"></Link> */}
                                <Link to="/profile" className="vote-avatar tiny avatar-2 for ml-n2 d-none d-md-block"></Link>
                                <Link to="/profile" className="vote-avatar tiny avatar-3 for ml-n2 d-none d-md-block"></Link>
                                <div onClick={(e) => {
                                    e.preventDefault();
                                    setIsShowingVotersModal(true);
                                    setUsersShowing(`People Voting For on ${l.questionText}`);
                                }} className="vote-avatar tiny count for ml-n2">{numeral(l.forCount).format('0a')}</div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="d-flex ml-2">
                                <Link to="/profile" className="vote-avatar tiny avatar-4 against ml-n2 d-none d-md-block"></Link>
                                {/* <Link to="/profile" className="vote-avatar tiny avatar-5 against ml-n2 d-none d-md-block"></Link> */}
                                <Link to="/profile" className="vote-avatar tiny avatar-6 against ml-n2 d-none d-md-block"></Link>
                                {/* <div className="vote-avatar tiny avatar-1 ml-n2" /> */}
                                <div onClick={() => {
                                    setIsShowingVotersModal(true);
                                    setUsersShowing(`People Voting Against on ${l.questionText}`);
                                }} className="vote-avatar tiny count against ml-n2">{numeral(l.againstCount).format('0a')}</div>
                            </div>
                            <div
                                className={`button_ small ${userVote === 'against' && 'selected'}`}
                            >
                                <span onClick={() => handleUserVote('against')}>
                                    Against
                                </span>
                                <div className="d-flex ml-3 my-n2 mr-n1">
                                    <Link to="/profile" className="vote-avatar tiny avatar-5 against ml-n2 d-none d-md-block"></Link>
                                    <div onClick={() => {
                                        setIsShowingVotersModal(true);
                                        setUsersShowing(`Your Representatives Voting Against on ${l.questionText}`);
                                    }} className="vote-avatar tiny count against ml-n2">+{1}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                            <PersonInList
                                key={el.name}
                                person={el}
                            />
                        ))}
                    </div>

                    {/* <CreateVote group={groupName} /> */}

                </Modal>
            </div>
        );
    }

