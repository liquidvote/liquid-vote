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
                {v.choices.map((c, i) => (
                    <div className="my-3">
                        <Choice
                            choiceText={c.text}
                            voteName={v.questionText}
                            groupHandle={v.groupChannel.group}
                            stats={c.stats}
                            userVote={c.userVote}
                            inList={true}
                        />
                    </div>
                ))}
            </div>

            {/* <pre>{JSON.stringify(v.choices, null, 2)}</pre> */}
        </div>
    );
}

