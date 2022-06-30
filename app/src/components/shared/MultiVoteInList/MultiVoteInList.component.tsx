import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { format } from 'timeago.js';
import ReactTooltip from 'react-tooltip';
import { timeAgo } from '@state/TimeAgo';

import VoteGraph1 from "@shared/VoteGraph1";
import './style.sass';
import { valores } from "@state/Mock/Votes";
import Choice from "@shared/Choice";
import GroupSvg from "@shared/Icons/Group.svg";
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";
import useSearchParams from "@state/Global/useSearchParams.effect";

export const MultiVoteInList: FunctionComponent<{
    v: any,
    showGroupAndTime: boolean,
    user?: any,
    showChart?: boolean,
}> = ({
    v,
    showGroupAndTime,
    user,
    showChart
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        const [showAllChoices, setShowAllChoices] = useState(false);

        // console.log({ v })

        // const sortedChoices = [...v.choices]?.
        //     sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes));

        // const maxVoteCount = sortedChoices?.[0]?.stats?.directVotes + sortedChoices?.[0]?.stats?.indirectVotes;

        return (
            <div className="position-relative">
                <ReactTooltip place="bottom" type="dark" effect="solid" />

                {/* <div className="time-ago d-flex flex-column justify-content-end pointer">
                    <ThreeDotsSmallSVG />
                </div> */}
                {v.thisUserIsAdmin && (
                    <div className="time-ago d-flex flex-column justify-content-end pointer">
                        <Popper
                            rightOnSmall={true}
                            button={<div><ThreeDotsSmallSVG /></div>}
                            popperContent={
                                <ul className="p-0 m-0 mx-2">
                                    <li
                                        className="pointer my-2 text-danger"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "DeletePoll",
                                                modalData: JSON.stringify({
                                                    questionText: v?.questionText,
                                                    group: v?.groupChannel?.group
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
                                                    questionText: v?.questionText,
                                                    groupHandle: v?.groupChannel?.group,
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

                {/* {!!showGroupAndTime && (
                    <div className="time-ago d-flex flex-column justify-content-end">
                        <small className="text-right" data-tip="Last vote was">
                            {!!v?.stats?.lastVoteOn ?
                                timeAgo.format(new Date(Number(v?.stats?.lastVoteOn))) :
                                'no votes yet'
                            }
                        </small>
                        <div className="d-flex justify-content-end mt-n1">
                            <Link
                                to={`/group/${v.groupChannel?.group}`}
                                className="badge ml-1 mb-1 mt-1"
                            >
                                {v.groupChannel?.group}
                            </Link>
                        </div>
                    </div>
                )} */}

                <div className="d-flex align-items-center flex-wrap">
                    <a
                        className="white"
                        href={`/multipoll/${encodeURIComponent(v.questionText)}/${v.groupChannel?.group}`}
                    >
                        <div
                            className={`question-title-in-list ${showGroupAndTime && 'limit-right'}`}
                            title={v.questionText}
                        >{v.questionText}?</div>
                    </a>

                    {/* {!!showGroupAndTime && (
                        <Link to={`/group/${v.groupChannel.group}`}
                            className="badge m-0 ml-2 text-truncate"
                        >{v.groupChannel.group}</Link>
                    )} */}
                </div>

                {showGroupAndTime && (
                    <div className="d-flex flex-column justify-content-end mb-n1">
                        <small className="tiny-text" data-tip="Last vote was">
                            {!!v?.stats.lastVoteOn ?
                                'last voted ' + timeAgo.format(new Date(Number(v?.stats?.lastVoteOn))) :
                                'no votes yet'
                            }
                        </small>
                    </div>
                )}

                <div>
                    {[...v.choices]?.
                        slice(0, showAllChoices ? v.choices?.length : 4)?.
                        sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes))
                        .map((c, i) => (
                            <div className="my-2" key={v.questionText + ' ' + c.text}>
                                <Choice
                                    choiceText={c.text}
                                    voteName={v.questionText}
                                    groupHandle={v.groupChannel.group}
                                    stats={c.stats}
                                    yourVote={c.yourVote}
                                    yourStats={c.yourStats}
                                    userVote={c.userVote}
                                    inList={true}
                                    // maxVoteCount={maxVoteCount}
                                    user={user}
                                    showChart={showChart}
                                />
                            </div>
                        ))}

                    {/* <pre style={{ 'color': 'white' }}>{JSON.stringify(v.choices, null, 2)}</pre> */}
                </div>

                {v.choices?.length > 4 && (
                    <div className="d-flex justify-content-start mt-3">
                        <div
                            className="white pointer underline"
                            onClick={() => setShowAllChoices(!showAllChoices)}
                        >{showAllChoices ? 'Show less' : `Show ${v.choices?.length - 4} more`}</div>
                    </div>
                )}
            </div>
        );
    }

