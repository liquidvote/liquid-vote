import React, { FunctionComponent, useEffect } from 'react';
import { Link } from "react-router-dom";

import useSearchParams from "@state/Global/useSearchParams.effect";
import Choice from "@shared/Choice";
import { timeAgo } from '@state/TimeAgo';
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";

import './style.sass';
import { useState } from 'react';

export const SingleVoteInList: FunctionComponent<{
    l: any,
    user?: any,
    showGroupAndTime?: boolean,
    hideTitle?: boolean,
    showChart?: boolean,
    inviterHandle?: string,
    votersInCommonStats?: any,
    originalQuestion?: any,
    originalQuestionMaxCount?: number
}> = ({
    l,
    user,
    showGroupAndTime,
    hideTitle,
    showChart,
    inviterHandle,
    votersInCommonStats,
    originalQuestion,
    originalQuestionMaxCount
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        const [showComparison, setShowComparison] = useState(false);

        return (
            <div className="position-relative">

                {l.thisUserIsAdmin && (
                    <div className="time-ago d-flex flex-column justify-content-end pointer">
                        <Popper
                            rightOnSmall={true}
                            button={<div>
                                <ThreeDotsSmallSVG />
                            </div>}
                            popperContent={
                                <ul className="p-0 m-0 mx-2">
                                    <li
                                        className="pointer my-2 text-danger"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "DeletePoll",
                                                modalData: JSON.stringify({
                                                    questionText: l?.questionText,
                                                    group: l?.groupChannel?.group
                                                })
                                            }
                                        })}
                                    >
                                        Delete
                                    </li>
                                    <li
                                        className="pointer my-2"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "EditQuestion",
                                                modalData: JSON.stringify({
                                                    questionText: l?.questionText,
                                                    groupHandle: l?.groupChannel?.group,
                                                })
                                            }
                                        })}
                                    >
                                        Edit
                                    </li>
                                </ul>
                            }
                        />
                    </div>
                )}

                {/* {(l.questionText && !hideTitle) && (
                    <small className="time-ago" data-tip="Last vote was">
                        {timeAgo.format(new Date(Number(l?.stats?.lastVoteOn)))}
                    </small>
                )} */}
                <div>
                    <div className="">
                        {(!!l.questionText && !hideTitle) && (
                            <div className="d-flex align-items-center flex-wrap">
                                <Link
                                    className="white mr-2"
                                    to={`/poll/${encodeURIComponent(l.questionText)}/${l.groupChannel?.group}`}
                                >
                                    <div className={`question-title-in-list ${showGroupAndTime && 'limit-right'}`} title={l.questionText}>
                                        {l.questionText}
                                    </div>
                                </Link>
                                {/* {l.userVote && (
                                    <VotedExplanation
                                        position={l.userVote.position}
                                        representeeVotes={l.userVote.representeeVotes}
                                        representatives={l.userVote.representatives}
                                        user={user}
                                    />
                                )} */}
                                {/* {!!showGroupAndTime && (
                                    <Link to={`/group/${l.groupChannel.group}`}
                                        className="badge m-0 ml-2 text-truncate"
                                    >{l.groupChannel.group}</Link>
                                )} */}
                            </div>
                        )}

                        {showGroupAndTime && (
                            <div className="d-flex flex-column justify-content-end mb-2 mt-1">
                                <small className="tiny-text" data-tip="Last vote was">
                                    {!!l?.stats.lastVoteOn ?
                                        'last vote was ' + timeAgo.format(new Date(Number(l?.stats?.lastVoteOn))) :
                                        'no votes yet'
                                    }
                                </small>
                            </div>
                        )}

                        <Choice
                            voteName={l.questionText}
                            groupHandle={l.groupChannel.group}
                            stats={l.stats}
                            yourVote={l.yourVote}
                            userVote={l.userVote}
                            user={user}
                            inList={true}
                            showChart={showChart}
                            yourStats={l.yourStats}
                            inviterHandle={inviterHandle}
                            votersInCommonStats={showComparison ? votersInCommonStats : null}
                            originalQuestion={showComparison ? originalQuestion : null}
                            maxVoteCount={originalQuestionMaxCount}
                        />

                        {votersInCommonStats ? (
                            <div className='d-flex mt-4 align-items-center justify-content-center'>
                                <small className='white pointer white-underline-onhover' onClick={() => setShowComparison(!showComparison)}>
                                    {showComparison ? 'Hide' : 'Show'} comparison 🧪
                                </small>
                            </div>
                        ): null}
                    </div>
                </div>
            </div>
        );
    }

