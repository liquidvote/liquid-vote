import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import GroupSvg from "@shared/Icons/Group.svg";
import VoteWrapper from "@shared/VoteWrapper";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
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
                                <div className="d-flex align-items-end">
                                    <Link to={`/profile/${v.user?.handle}`} className="d-block">
                                        <b className="mr-1">{v.user?.name}</b>
                                    </Link>
                                </div>
                                <div className="d-flex align-items-center mt-0 mb-0">
                                    {v.representeeVotes?.length > 0 && (
                                        <small className="d-flex align-items-center mr-1">
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
                                    {(!!v.representatives?.length) && (
                                        <small className="d-flex align-items-center d-inline-block mr-1">
                                            Represented by
                                            <span className="d-flex ml-2 pl-1">
                                                {v.representatives?.map((r: any, i: number) => (
                                                    <Link
                                                        key={`representatives-${r?.representativeHandle || i}`}
                                                        to={`/profile/${r?.representativeHandle}`}
                                                        className={`vote-avatar tiny ${r?.position} ml-n2`}
                                                        style={{
                                                            background: `url(${r?.representativeAvatar}) 50% 50% / cover no-repeat`
                                                        }}
                                                        title={r?.representativeName}
                                                    ></Link>
                                                ))}
                                            </span>
                                        </small>
                                    )}
                                    {
                                        (!v.representatives?.length) && (
                                            <small className="d-inline-block mr-1">
                                                Voted{' '}
                                                {v.question?.questionType === 'single' || !showChart ? (
                                                    <b className={`white ${v.question?.userVote.position?.toLowerCase()}Direct px-1 rounded`}>{v.question?.userVote.position}</b>
                                                ) : null}
                                            </small>
                                        )
                                    }

                                    <>
                                        {!showChart ? (
                                            <>
                                                <small className="">on</small>
                                                <Link
                                                    to={`/${v.question?.choiceText ? 'multipoll' : 'poll'}/${v.questionText}/${v.groupChannel?.group}`}
                                                ><b className="white">{v.question?.questionText}{v.question?.choiceText ? ':' + v.question?.choiceText : ''}</b></Link>
                                            </>
                                        ) : ''}
                                    </>
                                </div>
                            </div>
                            {(
                                <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                                    <small className="text-right" data-tip={`Last vote by ${v?.user?.name} on`}>
                                        {timeAgo.format(new Date(Number(v?.lastEditOn)))}
                                    </small>
                                    <div className="d-flex justify-content-end">
                                        {/* <div className="tiny-svg-wrapper"><GroupSvg /></div> */}
                                        <Link
                                            to={`/group/${v.groupChannel?.group}`}
                                            className="badge ml-1 mb-1 mt-1"
                                        >
                                            {v.groupChannel?.group}
                                        </Link>
                                    </div>
                                </div>
                            )}
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

                            {v.question?.questionType === 'multi' && (
                                <MultiVoteInList
                                    key={`multi-${v.questionText}`}
                                    showGroupAndTime={false}
                                    v={v.question}
                                    user={v.user}
                                />
                            )}
                            {v.question?.questionType === 'single' && (
                                <SingleVoteInList
                                    key={`single-${v.questionText}`}
                                    l={v.question}
                                    showGroupAndTime={false}
                                    showIntroMessage={true}
                                />
                            )}

                            {/* <Choice
                                choiceText={v.choiceText}
                                voteName={v.questionText}
                                groupHandle={v.groupChannel.group}
                                stats={v.QuestionStats}
                                yourVote={v.yourVote}
                                inList={true}
                            /> */}
                        </div>
                    )
                }
                <hr />
            </>
        );
    }

