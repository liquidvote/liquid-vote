import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";

import GroupSvg from "@shared/Icons/Group.svg";
import VoteWrapper from "@shared/VoteWrapper";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import Choice from "@shared/Choice";
import './style.sass';
import { timeAgo } from '@state/TimeAgo';

export const VoteInList: FunctionComponent<{
    v: any,
    showChart?: boolean,
    hideChoicesBesides?: string,
    showTitle?: boolean
}> = ({
    v,
    showChart = false,
    hideChoicesBesides,
    showTitle = false,
}) => {

        const [showAllChoices, setShowAllChoices] = useState(!hideChoicesBesides);

        const userVote = v.question?.questionType === 'single' ? v.question?.userVote :
            v.question?.choices?.find(c => c.text === hideChoicesBesides)?.userVote;

        console.log({
            userVote
        });

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
                                <div className="d-flex flex-wrap align-items-center mt-0 mb-0">
                                    {
                                        (
                                            !!showAllChoices && !v.representatives?.length ||
                                            !showAllChoices && !userVote.representatives?.length
                                        ) && (
                                            <small className="d-inline-block mr-1">
                                                Voted
                                                {(v.question?.questionType === 'single' || !showAllChoices) && (
                                                    <b className={`white ml-1 ${userVote?.position?.toLowerCase()}Direct px-1 rounded`}>
                                                        {userVote?.position}
                                                    </b>
                                                )}
                                            </small>
                                        )
                                    }
                                    {/* <pre>{JSON.stringify({showAllChoices, userVote}, null, 2)}</pre> */}
                                    {(
                                        !!showAllChoices && v.representeeVotes?.length > 0 ||
                                        !showAllChoices && userVote.representeeVotes?.length > 0
                                    ) && (
                                            <small className="d-flex align-items-center mr-1">
                                                Representing
                                                <div className="d-flex ml-2 pl-1 mr-1">
                                                    {(!!showAllChoices ?
                                                        v.representeeVotes :
                                                        userVote.representeeVotes
                                                    )?.map((r: any) => (
                                                        <Link
                                                            key={`representeeVotes-${r.user.handle}`}
                                                            to={`/profile/${r.user.handle}`}
                                                            className={`vote-avatar none tiny ml-n2`}
                                                            style={{
                                                                background: `url(${r.user.avatar}) 50% 50% / cover no-repeat`
                                                            }}
                                                            title={r.user.name}
                                                        ></Link>
                                                    ))}
                                                </div>
                                            </small>
                                        )}
                                    {(
                                        !!showAllChoices && v.representatives?.length > 0 ||
                                        !showAllChoices && userVote.representatives?.length > 0
                                    ) && (
                                            <small className="d-flex align-items-center d-inline-block mr-1">
                                                Represented by
                                                <span className="d-flex ml-2 pl-1">
                                                    {(!!showAllChoices ?
                                                        v.representatives :
                                                        userVote.representatives
                                                    )?.map((r: any, i: number) => (
                                                        <Link
                                                            key={`representatives-${r?.representativeHandle || i}`}
                                                            to={`/profile/${r?.representativeHandle}`}
                                                            className={`vote-avatar tiny ${!!showAllChoices && v.question?.questionType === 'multi' ? 'none': r?.position} ml-n2`}
                                                            style={{
                                                                background: `url(${r?.representativeAvatar}) 50% 50% / cover no-repeat`
                                                            }}
                                                            title={r?.representativeName}
                                                        ></Link>
                                                    ))}
                                                </span>
                                            </small>
                                        )}

                                    <>
                                        {(showTitle && v.question?.questionType === 'single' && !showChart) ? (
                                            <>
                                                <small className="mr-1">on</small>
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
                {(v.question?.questionType === 'multi' && (showAllChoices || showChart)) && (
                    <div key={`notificationVote-${v.questionText}`} className="mt-1">
                        <MultiVoteInList
                            key={`multi-${v.questionText}`}
                            showGroupAndTime={false}
                            v={v.question}
                            user={v.user}
                            showChart={showChart}
                        />
                    </div>
                )}
                {(v.question?.questionType === 'single' && showChart) && (
                    <div key={`notificationVote-${v.questionText}`} className="mt-1">
                        <SingleVoteInList
                            key={`single-${v.questionText}`}
                            l={v.question}
                            showGroupAndTime={false}
                            showIntroMessage={true}
                            showChart={showChart}
                        />
                    </div>
                )}
                {!!hideChoicesBesides && (
                    <div className="d-flex justify-content-end">
                        <small
                            className="white pointer"
                            onClick={() => setShowAllChoices(!showAllChoices)}
                        >{showAllChoices ? 'Hide' : 'Show'} votes on other choices</small>
                    </div>
                )}
                <hr />
            </>
        );
    }

