import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import GroupSvg from "@shared/Icons/Group.svg";

import VoteWrapper from "@shared/VoteWrapper";
import './style.sass';

export const Notification: FunctionComponent<{ v: any, showChart?: boolean }> = ({ v, showChart = false }) => {

    const [userVote, setUserVote] = React.useState(null);
    const handleUserVote = (vote: string) => {
        if (vote === userVote) {
            setUserVote(null)
        } else {
            setUserVote(vote);
        }
    }

    return (
        <>
            <div className="d-flex relative align-items-center">
                <Link to="/profile">
                    <div className={`small-avatar bg avatar-${v.who.avatarClass} `}></div>
                </Link>
                <div className="flex-fill">
                    <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                        <div>
                            <Link to="/profile">
                                <b className="mr-1">{v.who.name}</b>
                                <small className="mr-1">{v.who.handle}</small>
                            </Link>
                            {v.who.representsYou && (
                                <div className="badge">Represents You</div>
                            )}
                            {v.who.youRepresent && (
                                <div className="badge inverted">You Represent</div>
                            )}
                            <p className="mt-0 mb-0">
                                {v.type && v.type === 'Changed Vote' && (
                                    <small>
                                        Changed vote to{' '}
                                        <b className={`white ${v.position.toLowerCase()}Direct px-1 rounded`}>{v.position}</b>
                                    </small>
                                )}
                                {v.type && v.type === 'Voted' && (
                                    <small>
                                        Voted {' '}
                                        <b className={`white ${v.position.toLowerCase()}Direct px-1 rounded`}>{v.position}</b>
                                    </small>
                                )}
                                {v.type && v.type === 'Removed Vote' && (
                                    <small>
                                        Removed{' '}
                                        <b className={`white ${v.position.toLowerCase()}Direct px-1 rounded`}>{v.position}</b>{' '}
                                vote
                                    </small>
                                )}
                                {v.poll && (
                                    <small>
                                        {' '}
                                on <Link to={`/poll/${v.poll}`}><b className="white">{v.poll}</b></Link>
                                    </small>
                                )}
                                {v.message && (
                                    <>
                                        {v.message} <Link to="/poll/equal%20rights"><b className="white">{v.name}</b></Link>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                            <small className="text-right">3 days ago</small>
                            <div className="d-flex flex-wrap justify-content-end">
                                <div className="tiny-svg-wrapper"><GroupSvg /></div>
                                <div className={`badge ml-1 mb-1 mt-1`}>Algarve Flats</div>
                                <div className={`badge ml-1 mb-1 mt-1`}>Moon Investors</div>
                                <div className={`badge ml-1 mb-1 mt-1`}>+3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {v.comment && (
                <p className="mt-1 mb-0">
                    {v.comment}
                </p>
            )}
            {
                showChart && (
                    <div>
                        <VoteWrapper l={{ ...v, name: '' }} />
                    </div>
                )
            }
            <hr />
        </>
    );
}

