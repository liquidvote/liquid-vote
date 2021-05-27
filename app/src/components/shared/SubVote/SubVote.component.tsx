import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';

import VoteGraph1 from "@shared/VoteGraph1";
import './style.sass';

export const SubVote: FunctionComponent<{ i: number, l: any, introMessage?: string, showQuestionMarkInName?: boolean }> = ({ i, l, introMessage, showQuestionMarkInName = true }) => {

    const [userVote, setUserVote] = React.useState(null);
    const handleUserVote = (vote: string) => {
        if (vote === userVote) {
            setUserVote(null)
        } else {
            setUserVote(vote);
        }
    }

    return (
        <div className="position-relative">

            <small className="time-ago" data-tip="Last vote was">
                12s
            </small>

            {/* <small className="do-you mb-n2">{introMessage || 'Do you approve'}</small> */}
            <div className="bar-wrapper-horizontal mb-3" style={{ width: 100 - i * 10 + '%' }}>
                <VoteGraph1 key={`d-${i}`} {...l} showQuestionMarkInName={showQuestionMarkInName} />
            </div>

            <div className="d-flex d-flex justify-content-between mt-n2">
                <div className="d-flex align-items-center">
                    <div
                        onClick={() => handleUserVote('for')}
                        className={`button_ small ${userVote === 'for' && 'selected'}`}
                    >
                        For
                            <div className="d-flex ml-3 my-n2 mr-n1">
                            <Link to="/profile" className="vote-avatar tiny avatar-1 for ml-n2 d-none d-md-block"></Link>
                            <div className="vote-avatar tiny count for ml-n2">{3}</div>
                        </div>
                    </div>
                    <div className="d-flex ml-2  mt-n2">
                        {/* <Link to="/profile" className="vote-avatar tiny avatar-1 for ml-n2"></Link> */}
                        <Link to="/profile" className="vote-avatar tiny avatar-2 for ml-n2 d-none d-md-block"></Link>
                        <Link to="/profile" className="vote-avatar tiny avatar-3 for ml-n2 d-none d-md-block"></Link>
                        <div className="vote-avatar tiny count for ml-n2">{numeral(l.forCount).format('0a')}</div>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <div className="d-flex ml-2 mt-n2">
                        <Link to="/profile" className="vote-avatar tiny avatar-4 against ml-n2 d-none d-md-block"></Link>
                        {/* <Link to="/profile" className="vote-avatar tiny avatar-5 against ml-n2 d-none d-md-block"></Link> */}
                        <Link to="/profile" className="vote-avatar tiny avatar-6 against ml-n2 d-none d-md-block"></Link>
                        {/* <div className="vote-avatar tiny avatar-1 ml-n2" /> */}
                        <div className="vote-avatar tiny count against ml-n2">{numeral(l.againstCount).format('0a')}</div>
                    </div>
                    <div
                        onClick={() => handleUserVote('against')}
                        className={`button_ small ${userVote === 'against' && 'selected'}`}
                    >
                        Against
                        <div className="d-flex ml-3 my-n2 mr-n1">
                            <Link to="/profile" className="vote-avatar tiny avatar-5 against ml-n2 d-none d-md-block"></Link>
                            <div className="vote-avatar tiny count against ml-n2">{1}</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

