import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { format } from 'timeago.js';
import ReactTooltip from 'react-tooltip';
import { timeAgo } from '@state/TimeAgo';

import VoteGraph1 from "@shared/VoteGraph1";
import './style.sass';
import { valores } from "@state/Mock/Votes";
import Choice from "@shared/Choice";

export const MultiVoteInList: FunctionComponent<{
    v: any,
    showGroupAndTime: boolean,
    user: any
}> = ({
    v,
    showGroupAndTime,
    user
}) => {

        console.log({ v })

        const sortedChoices = [...v.choices]?.
            sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes));

        const maxVoteCount = sortedChoices?.[0]?.stats?.directVotes + sortedChoices?.[0]?.stats?.indirectVotes;

        return (
            <div className="position-relative">
                <ReactTooltip place="bottom" type="dark" effect="solid" />

                {!!showGroupAndTime && (
                    <div className="time-ago" data-tip="Last vote was">
                        <small data-tip="last vote was">{timeAgo.format(new Date(Number(v?.stats?.lastVoteOn)))}</small>
                    </div>
                )}

                <div className="d-flex align-items-center flex-wrap mb-2">
                    <a
                        className="white"
                        href={`/multipoll/${v.questionText}/${v.groupChannel?.group}`}
                    >
                        <div
                            className="text-truncate mw-180-px-sm mr-2"
                            title={v.questionText}
                        >{v.questionText}?</div>
                    </a>

                    {!!showGroupAndTime && (
                        <Link to={`/group/${v.groupChannel.group}`}
                            className="badge m-0 ml-2 text-truncate"
                        >{v.groupChannel.group}</Link>
                    )}
                </div>

                <div>
                    {sortedChoices?.
                        sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes))
                        .map((c, i) => (
                            <div className="my-2" key={v.questionText + ' ' + c.text}>
                                <Choice
                                    choiceText={c.text}
                                    voteName={v.questionText}
                                    groupHandle={v.groupChannel.group}
                                    stats={c.stats}
                                    yourVote={c.yourVote}
                                    userVote={c.userVote}
                                    inList={true}
                                    maxVoteCount={maxVoteCount}
                                    user={user}
                                />
                            </div>
                        ))}

                    {/* <pre style={{ 'color': 'white' }}>{JSON.stringify(v.choices, null, 2)}</pre> */}
                </div>

                {/* <pre>{JSON.stringify(v.choices, null, 2)}</pre> */}
            </div>
        );
    }

