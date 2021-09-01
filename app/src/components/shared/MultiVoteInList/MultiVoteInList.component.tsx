import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { format } from 'timeago.js';
import ReactTooltip from 'react-tooltip';

import VoteGraph1 from "@shared/VoteGraph1";
import './style.sass';
import { valores } from "@state/Mock/Votes";
import Choice from "@shared/Choice";

export const MultiVoteInList: FunctionComponent<{ v: any, i?: number }> = ({ v, i = 0 }) => {

    const sortedChoices = [...v.choices]?.
        sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes));
    
    const maxVoteCount = sortedChoices?.[0]?.stats?.directVotes + sortedChoices?.[0]?.stats?.indirectVotes;

    return (
        <div className="position-relative">
            <ReactTooltip place="bottom" type="dark" effect="solid" />

            <div className="time-ago" data-tip="Last vote was">
                <small data-tip="last vote was">{format(Date.now() - (i + Math.random()) * 1000 * 60 * 60)}</small>
            </div>

            <div className="d-flex align-items-center flex-wrap mb-2">
                <a
                    className="white"
                    href={`/multipoll/${v.questionText}/${v.groupChannel?.group}`}
                >
                    <div
                        className="text-truncate mw-180-px-sm mr-2"
                        title={v.questionText}
                    >{v.questionText}</div>
                </a>

                <div
                    className="badge m-0 ml-2 text-truncate"
                >{v.groupChannel.group}</div>
            </div>

            <div>
                {sortedChoices?.
                    sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes))
                    .map((c, i) => (
                        <div className="my-3">
                            <Choice
                                choiceText={c.text}
                                voteName={v.questionText}
                                groupHandle={v.groupChannel.group}
                                stats={c.stats}
                                userVote={c.userVote}
                                inList={true}
                                maxVoteCount={maxVoteCount}
                            />
                        </div>
                    ))}

                <pre style={{ 'color': 'white' }}>{JSON.stringify(v.choices, null, 2)}</pre>
            </div>

            {/* <pre>{JSON.stringify(v.choices, null, 2)}</pre> */}
        </div>
    );
}

