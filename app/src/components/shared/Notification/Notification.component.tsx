import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import GroupSvg from "@shared/Icons/Group.svg";

import VoteWrapper from "@shared/VoteWrapper";
import SingleVoteInList from "@shared/SingleVoteInList";
import Choice from "@shared/Choice";
import './style.sass';
import { timeAgo } from '@state/TimeAgo';

export const Notification: FunctionComponent<{
    v: any,
    showChart?: boolean
}> = ({
    v,
    showChart = false
}) => {

        return (
            <>
                <div className="d-flex relative align-items-center">
                    <Link to={`/profile/${v.user?.handle}`}>
                        <div
                            className={`small-avatar bg`}
                            style={{
                                background: v.user?.avatar && `url(${v.user?.avatar}) 50% 50% / cover no-repeat`
                            }}
                        ></div>
                    </Link>
                    <div className="flex-fill">
                        <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                            <div className="w-75">
                                <Link to={`/profile/${v.user?.handle}`} className="d-block mb-n1">
                                    <b className="mr-1">{v.user?.name}</b>
                                </Link>
                                <p className="d-inline-block mt-0 mb-0">

                                    {
                                        v.isDirect ? (
                                            <small className="mr-1 d-inline-block">
                                                Voted{' '}
                                                <b className={`white ${v.position?.toLowerCase()}Direct px-1 rounded`}>{v.position}</b>
                                            </small>
                                        ) : (
                                            <small className="d-flex align-items-center d-inline-block">
                                                Was represented by
                                                <span className="d-flex ml-2 pl-1 mr-1">
                                                    {v.representatives?.map((r: any) => (
                                                        <Link
                                                            key={`representatives-${v?.representativeHandle}`}
                                                            to={`/profile/${r.representativeHandle}`}
                                                            className={`vote-avatar tiny ${r.position} ml-n2`}
                                                            style={{
                                                                background: `url(${r.representativeAvatar}) 50% 50% / cover no-repeat`
                                                            }}
                                                            title={r.representativeName}
                                                        ></Link>
                                                    ))}
                                                </span>
                                            </small>
                                        )
                                    }

                                    <>
                                        <small className="mr-1">on</small>
                                        <Link
                                            to={`/${v.choiceText ? 'multipoll' : 'poll'}/${v.questionText}/${v.groupChannel?.group}`}
                                        ><b className="white">{v.questionText}{v.choiceText ? ':' + v.choiceText : ''}</b></Link>
                                    </>

                                </p>
                                {/* <pre>{JSON.stringify(v, null, 2)}</pre> */}
                                {v.representeeVotes?.length > 0 && (
                                    <small className="d-flex align-items-center">
                                        Representing
                                        <div className="d-flex ml-2 pl-1 mr-1">
                                            {v.representeeVotes?.map((r: any) => (
                                                <Link
                                                    key={`representeeVotes-${r.user.handle}`}
                                                    to={`/profile/${r.user.handle}`}
                                                    className={`vote-avatar tiny ml-n2`}
                                                    style={{
                                                        background: `url(${r.user.avatar}) 50% 50% / cover no-repeat`
                                                    }}
                                                    title={r.user.name}
                                                ></Link>
                                            ))}
                                        </div>
                                    </small>
                                )}
                            </div>
                            <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                                <small className="text-right" data-tip="Voted on">
                                    {timeAgo.format(new Date(Number(v?.lastEditOn)))}
                                </small>
                                <div className="d-flex flex-wrap justify-content-end">
                                    <div className="tiny-svg-wrapper"><GroupSvg /></div>
                                    <Link
                                        to={`/group/${v.groupChannel?.group}`}
                                        className="badge ml-1 mb-1 mt-1"
                                    >
                                        {v.groupChannel?.group}
                                    </Link>
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
                        <div key={`notificationVote-${v.questionText}`} className="mt-1">
                            <Choice
                                choiceText={v.choiceText}
                                voteName={v.questionText}
                                groupHandle={v.groupChannel.group}
                                stats={v.QuestionStats}
                                userVote={v.yourVote}
                                inList={true}
                            />
                        </div>
                    )
                }
                <hr />
            </>
        );
    }

