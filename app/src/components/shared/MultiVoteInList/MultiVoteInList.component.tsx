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
                    // href={`/multipoll/${v.questionText}`}
                    href={`/multipoll/${v.questionText}/${v.groupChannel?.group}-${v.groupChannel?.channel}`}
                >
                    <div
                        className="text-truncate mw-180-px-sm mr-2"
                        title={v.questionText}
                    >{v.questionText}</div>
                </a>

                <div
                    className="badge m-0 ml-2 text-truncate"
                >{v.groupChannel.group}: {v.groupChannel.channel}</div>
            </div>

            <div>
                {v.choices.map((c, i) => (
                    <div className="my-3">
                        <Choice
                            choiceText={c.text}
                            voteName={v.questionText}
                            groupChannel={v.groupChannel.group + '-' + v.groupChannel.channel}
                            stats={c.stats}
                            userVote={c.userVote}
                            inList={true}
                        />
                    </div>
                    // <div
                    //     key={`choice-${i}`}
                    //     className="d-flex justify-content-end mb-2 align-items-center flex-column flex-column"
                    // >
                    //     <div className="w-100 d-flex justify-content-between mb-1">
                    //         <div className="white position-relative ml-1">
                    //             <small className="text-truncate d-block mr-2">{l.text}</small>
                    //         </div>
                    //         <div className="bar-wrapper m-0 mt-n1" style={{ width: l.flexSize * 10 + '%' }}>
                    //             <VoteGraph1
                    //                 key={`a-${i}`}
                    //                 {...l}
                    //                 showNameInside={true}
                    //                 name={''}
                    //             />
                    //         </div>
                    //     </div>
                    //     <div className="d-flex w-100 d-flex justify-content-between small-for-against-buttons-container">
                    //         <div className="d-flex align-items-center">
                    //             <div
                    //                 // onClick={() => handleUserVote('for')}
                    //                 className={`button_ small mr-0`} // ${userVote === 'for' && 'selected'}
                    //             >
                    //                 For
                    //                 {!!l.representativesFor?.length && (
                    //                     <div className="d-flex ml-3 my-n2 mr-n1">
                    //                         <Link to="/profile" className={`vote-avatar tiny avatar-${l.representativesFor[0]} for ml-n2`}></Link>
                    //                         {l.representativesFor.length > 1 && (
                    //                             <div className="vote-avatar tiny count for ml-n2">+{l.representativesFor.length - 1}</div>
                    //                         )}
                    //                     </div>
                    //                 )}
                    //             </div>
                    //             <div className="d-flex ml-2">
                    //                 {/* <Link to="/profile" className="vote-avatar tiny avatar-1 for ml-n2"></Link> */}
                    //                 <div onClick={(e) => {
                    //                     e.preventDefault();
                    //                 }} className="vote-avatar tiny count for ml-n1">{numeral(l.forCount).format('0a')}</div>
                    //             </div>
                    //         </div>
                    //         <div className="d-flex align-items-center ml-2">
                    //             <div className="d-flex">
                    //                 <div onClick={() => {
                    //                     // setIsShowingVotersModal(true);
                    //                     // setUsersShowing(`People Voting Against on ${l.questionText}`);
                    //                 }} className="vote-avatar tiny count against mr-1">{numeral(l.againstCount).format('0a')}</div>
                    //             </div>
                    //             <div
                    //                 // onClick={() => handleUserVote('against')}
                    //                 className={`button_ small mx-0`} //${userVote === 'against' && 'selected'}
                    //             >
                    //                 Against
                    //                 {!!l.representativesAgainst?.length && (
                    //                     <div className="d-flex ml-3 my-n2 mr-n1">
                    //                         <Link to="/profile" className={`vote-avatar tiny avatar-${l.representativesAgainst[0]} against ml-n2`}></Link>
                    //                         {l.representativesAgainst.length > 1 && (
                    //                             <div className="vote-avatar tiny count against ml-n2">+{l.representativesAgainst.length - 1}</div>
                    //                         )}
                    //                     </div>
                    //                 )}
                    //             </div>
                    //         </div>
                    //     </div>
                    // </div>
                ))}
            </div>

            {/* <pre>{JSON.stringify(v.choices, null, 2)}</pre> */}
        </div>
    );
}

