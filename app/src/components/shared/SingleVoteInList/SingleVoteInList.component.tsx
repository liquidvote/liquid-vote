import React, { FunctionComponent, useEffect } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";
import ReactTooltip from 'react-tooltip';

// import VoteGraph1 from "@shared/VoteGraph1";
import Chart from "@shared/VoteGraph1/chart.svg";
import ProfilePlus from "@shared/Icons/Profile+-small.svg";
import { EDIT_VOTE } from '@state/Vote/typeDefs';
import { voteStatsMap } from '@state/Question/map';
import useSearchParams from "@state/Global/useSearchParams.effect";
import Choice from "@shared/Choice";
import GroupSvg from "@shared/Icons/Group.svg";
import { timeAgo } from '@state/TimeAgo';
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";

import './style.sass';

export const SingleVoteInList: FunctionComponent<{
    l: any,
    introMessage?: string,
    showIntroMessage?: boolean,
    showColorLegend?: boolean,
    showGroupAndTime?: boolean,
    hideTitle?: boolean,
    showChart?: boolean,
}> = ({
    l,
    introMessage,
    showIntroMessage,
    showColorLegend,
    showGroupAndTime,
    hideTitle,
    showChart
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

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
                    {(showIntroMessage && !hideTitle) && (
                        <small className="do-you d-flex mb-n1">{introMessage || `Do you ${l?.startText || 'approve'}`}</small>
                    )}
                    <div className="bar-wrapper">
                        {(!!l.questionText && !hideTitle) && (
                            <div className="mb-1 d-flex align-items-center">
                                <a
                                    className="white mb-0"
                                    href={`/poll/${l.questionText}/${l.groupChannel?.group}`}
                                >
                                    <div className={`question-title-in-list ${showGroupAndTime && 'limit-right'}`} title={l.questionText}>
                                        {l.questionText}
                                        {showIntroMessage && '?'}
                                    </div>
                                </a>
                                {/* {!!showGroupAndTime && (
                                    <Link to={`/group/${l.groupChannel.group}`}
                                        className="badge m-0 ml-2 text-truncate"
                                    >{l.groupChannel.group}</Link>
                                )} */}
                            </div>
                        )}

                        {showGroupAndTime && (
                            <div className="d-flex flex-column justify-content-end mb-1 mt-n1">
                                <small className="tiny-text" data-tip="Last vote was">
                                    {!!l?.stats.lastVoteOn ?
                                        'last voted ' + timeAgo.format(new Date(Number(l?.stats?.lastVoteOn))) :
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
                            inList={true}
                            showChart={showChart}
                        />
                    </div>
                </div>
            </div>
        );
    }

