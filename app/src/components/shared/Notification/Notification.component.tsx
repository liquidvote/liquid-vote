import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import GroupSvg from "@shared/Icons/Group.svg";

import VoteWrapper from "@shared/VoteWrapper";
import SingleVoteInList from "@shared/SingleVoteInList";
import './style.sass';
import { timeAgo } from '@state/TimeAgo';

export const Notification: FunctionComponent<{
    v: any,
    showChart?: boolean
}> = ({
    v,
    showChart = false
}) => {

        // Types
        //  Voted
        //  Changed Vote
        //  Removed Vote
        //
        //  Joined Group ?

        return (
            <>
                <div className="d-flex relative align-items-center">
                    <Link to={`/profile/${v.user?.handle}`}>
                        <div
                            className={`small-avatar bg`}
                            style={{
                                background: v.user?.avatar && `url(${v.user?.avatar}) no-repeat`,
                                backgroundSize: 'cover'
                            }}
                        ></div>
                    </Link>
                    <div className="flex-fill">
                        <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                            <div>
                                <Link to={`/profile/${v.user?.handle}`}>
                                    <b className="mr-1">{v.user?.name}</b>
                                </Link>
                                <p className="d-flex align-items-center mt-0 mb-0">

                                    {
                                        v.isDirect ? (
                                            <small className="mr-1">
                                                Voted{' '}
                                                <b className={`white ${v.position?.toLowerCase()}Direct px-1 rounded`}>{v.position}</b>
                                            </small>
                                        ) : (
                                            <small className="d-flex align-items-center">
                                                Was represented by
                                                <div className="d-flex ml-2 pl-1 mr-1">
                                                    {v.representatives?.map((r: any) => (
                                                        <Link
                                                            to={`/profile/${r.representativeHandle}`}
                                                            className={`vote-avatar tiny ${r.position} ml-n2 d-none d-md-block`}
                                                            style={{
                                                                background: `url(${r.representativeAvatar}) no-repeat`,
                                                                backgroundSize: 'cover'
                                                            }}
                                                            title={r.representativeName}
                                                        ></Link>
                                                    ))}
                                                </div>
                                            </small>
                                        )
                                    }

                                    <>
                                        <small className="mr-1">on</small>
                                        <Link
                                            to={`/poll/${v.questionText}/${v.groupChannel?.group}-${v.groupChannel?.channel}`}
                                        ><b className="white">{v.questionText}</b></Link>
                                    </>

                                </p>
                                {v.representeeVotes && (
                                    <small className="d-flex align-items-center">
                                        Representing
                                        <div className="d-flex ml-2 pl-1 mr-1">
                                            {v.representeeVotes?.map((r: any) => (
                                                <Link
                                                    to={`/profile/${r.user.handle}`}
                                                    className={`vote-avatar tiny ml-n2 d-none d-md-block`}
                                                    style={{
                                                        background: `url(${r.user.avatar}) no-repeat`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                    title={r.user.name}
                                                ></Link>
                                            ))}
                                        </div>
                                    </small>
                                )}
                            </div>
                            <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                                <small className="text-right">{timeAgo.format(new Date(Number(v?.lastEditOn)))}</small>
                                <div className="d-flex flex-wrap justify-content-end">
                                    <div className="tiny-svg-wrapper"><GroupSvg /></div>
                                    <div className="badge ml-1 mb-1 mt-1">
                                        {v.groupChannel?.group}:
                                        {v.groupChannel?.channel}
                                    </div>
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
                        <div key={`notificationVote-${v.questionText}`}>
                            <SingleVoteInList
                                l={{
                                    ...v,
                                    hideTitle: true,
                                    userVote: v.yourVote,
                                    stats: v.QuestionStats
                                }}
                            />
                        </div>
                    )
                }
                <hr />
            </>
        );
    }

