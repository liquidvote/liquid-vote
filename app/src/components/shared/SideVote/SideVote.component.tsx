import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import Modal from 'react-modal';

import VoteGraph1 from "@shared/VoteGraph1";
import XSVG from "@shared/Icons/X.svg";
import { people } from "@state/Mock/People";
import PersonInList from '@shared/PersonInList';

import './style.sass';

export const SideVote: FunctionComponent<{ i: number, l: any }> = ({ i, l }) => {

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

    return (
        <div className="position-relative">
            {/* <ReactTooltip place="bottom" type="dark" effect="solid" /> */}
            <div className="time-ago" data-tip="Last vote was">
                12s
            </div>

            <div className="bar-wrapper-horizontal-small mb-2" style={{ width: 100 - i * 10 + '%' }}>
                <VoteGraph1 key={`d-${i}`} {...l} showNameInside={false} />
            </div>

            <div className="d-flex d-flex justify-content-between mt-n1 mb-2">
                <div className="d-flex align-items-center">
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
                                setUsersShowing(`Your Representatives Voting For on ${l.name}`);
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
                            setUsersShowing(`People Voting For on ${l.name}`);
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
                            setUsersShowing(`People Voting Against on ${l.name}`);
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
                                setUsersShowing(`Your Representatives Voting Against on ${l.name}`);
                            }} className="vote-avatar tiny count against ml-n2">+{1}</div>
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
                        <PersonInList person={el} />
                    ))}
                </div>

                {/* <CreateVote group={groupName} /> */}

            </Modal>
        </div>
    );
}

