import React, { FunctionComponent, useEffect } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";
import { timeAgo } from '@state/TimeAgo';
import ReactTooltip from 'react-tooltip';

// import VoteGraph1 from "@shared/VoteGraph1";
import Chart from "@shared/VoteGraph1/chart.svg";
import ProfilePlus from "@shared/Icons/Profile+-small.svg";
import { EDIT_VOTE } from '@state/Vote/typeDefs';
import { voteStatsMap } from '@state/Question/map';
import useSearchParams from "@state/Global/useSearchParams.effect";
import Choice from "@shared/Choice";

import './style.sass';

export const SingleVoteInList: FunctionComponent<{
    l: any,
    introMessage?: string,
    showIntroMessage?: boolean,
    showColorLegend?: boolean,
    showGroup?: boolean,
    hideTitle?: boolean
}> = ({
    l,
    introMessage,
    showIntroMessage,
    showColorLegend,
    showGroup,
    hideTitle
}) => {

        return (
            <div className="position-relative">
                {(l.questionText && !hideTitle) && (
                    <small className="time-ago" data-tip="Last vote was">
                        {timeAgo.format(new Date(Number(l?.stats?.lastVoteOn)))}
                    </small>
                )}
                <div>
                    {(showIntroMessage && !hideTitle) && (
                        <small className="do-you d-flex mb-n1">{introMessage || 'Do you approve'}</small>
                    )}
                    <div className="bar-wrapper">
                        {(!!l.questionText && !hideTitle) && (
                            <div className="mb-1 d-flex align-items-center">
                                <a
                                    className="white mb-0"
                                    href={`/poll/${l.questionText}/${l.groupChannel?.group}-${l.groupChannel?.channel}`}
                                >
                                    <div className="text-truncate" title={l.questionText}>
                                        {l.questionText}
                                        {showIntroMessage && '?'}
                                    </div>
                                </a>
                                {!!showGroup && (
                                    <div className="badge m-0 ml-2">
                                        {l.groupChannel?.group}:
                                        {l.groupChannel?.channel}
                                    </div>
                                )}
                            </div>
                        )}

                        <Choice
                            voteName={l.questionText}
                            groupChannel={l.groupChannel.group + '-' + l.groupChannel.channel}
                            stats={l.stats}
                            userVote={l.userVote}
                            inList={true}
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-center">
                    {/* {l.thisUserIsAdmin && (
                        <>
                            <div
                                onClick={() => alert('soon')}
                                className={`button_ small mx-1`}
                            >Edit</div>
                        </>
                    )} */}
                    <div
                        title="Invite to vote"
                        className={`pointer mx-1`}
                        onClick={() => alert('Invite to vote - soon')}
                    ><ProfilePlus /> 🧪</div>
                </div>
            </div>
        );
    }

