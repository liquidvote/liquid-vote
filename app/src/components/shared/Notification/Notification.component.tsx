import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";

import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import './style.sass';
import { timeAgo } from '@state/TimeAgo';
import VotedExplanation from '@shared/VotedExplanation';
import Avatar from "@components/shared/Avatar";

export const Notification: FunctionComponent<{
    v: any,
    showUser?: boolean,
    showChart?: boolean,
    hideChoicesBesides?: string,
}> = ({
    v,
    showUser = true,
    showChart = false,
    hideChoicesBesides
}) => {

        console.log({ v });

        const [showAllChoices, setShowAllChoices] = useState(!hideChoicesBesides);

        const userVote = v.question?.questionType === 'single' ? v.question?.userVote :
            v.question?.choices?.find(c => c.text === hideChoicesBesides)?.userVote;

        return (
            <>
                <div className="d-flex relative align-items-center">
                    {!!showUser && (
                        <Link to={`/profile/${v.user?.handle}`}>
                            <Avatar
                                person={v.user}
                                groupHandle={v?.groupChannel?.group}
                                type="small"
                            />
                            {/* <div
                                className={`small-avatar bg`}
                                style={{
                                    background: v.user?.avatar && `url(${v.user?.avatar}) 50% 50% / cover no-repeat`
                                }}
                            ></div> */}
                        </Link>
                    )}
                    <div className="flex-fill">
                        <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                            <div className="w-75">
                                {!!showUser && (
                                    <div className="d-flex align-items-end">
                                        <Link to={`/profile/${v.user?.handle}`} className="d-block">
                                            <b className="mr-1">{v.user?.name}</b>
                                        </Link>
                                    </div>
                                )}
                                <div className="d-flex flex-wrap align-items-center mt-0 mb-0">
                                    {!showChart ? (
                                        <VotedExplanation
                                            position={userVote.position}
                                            representeeVotes={userVote.representeeVotes}
                                            representatives={userVote.representatives}
                                            user={v.user}
                                            groupHandle={v?.groupChannel?.group}
                                        />
                                    ) : ''}
                                </div>
                            </div>
                            {(
                                <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                                    <small className="text-right" data-tip={`Last vote by ${v?.user?.name} was`}>
                                        {timeAgo.format(new Date(Number(v?.lastEditOn)))}
                                    </small>
                                    {/* <div className="d-flex justify-content-end">
                                        <Link
                                            to={`/group/${v.groupChannel?.group}`}
                                            className="badge ml-1 mb-1 mt-1"
                                        >
                                            {v.groupChannel?.group}
                                        </Link>
                                    </div> */}
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
                            user={v.user}
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

