import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";

import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import './style.sass';
import { timeAgo } from '@state/TimeAgo';
import VotedExplanation from './VotedExplanation';
import Avatar from "@components/shared/Avatar";

export const Vote: FunctionComponent<{
    v: any,
    showChart?: boolean,
    hideChoicesBesides?: string,
}> = ({
    v,
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

                    <Link to={`/profile/${v.user?.handle}`}>
                        <Avatar
                            person={v.user}
                            groupHandle={v?.groupChannel?.group}
                            type="small"
                        />
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
                                    <>
                                        <VotedExplanation
                                            position={userVote?.position}
                                            forWeight={userVote?.forWeight}
                                            againstWeight={userVote?.againstWeight}
                                            representeeVotes={userVote?.representeeVotes}
                                            representatives={userVote?.representatives}
                                            user={v.user}
                                            groupHandle={v?.groupChannel?.group}
                                        />
                                    </>
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
                {/* {v.comment && (
                    <p className="mt-1 mb-0">
                        {v.comment}
                    </p>
                )} */}


                {(v.question?.questionType === 'multi' && (showAllChoices)) && (
                    <div className="mt-2">

                        {v.question?.choices?.map(c => (
                            <div className='d-flex my-2'>
                                <b>{c.text}</b>:
                                <span className="d-flex mx-2">
                                    <Link to={`/profile/${v.user.handle}/cause/${v?.groupChannel?.group}`}>
                                        <Avatar
                                            person={v.user}
                                            groupHandle={v?.groupChannel?.group}
                                            type="tiny"
                                        />
                                    </Link>
                                </span>

                                <VotedExplanation
                                    position={c.userVote?.position}
                                    forWeight={userVote?.forWeight}
                                    againstWeight={userVote?.againstWeight}
                                    representeeVotes={c.userVote?.representeeVotes}
                                    representatives={c.userVote?.representatives}
                                    user={v.user}
                                    groupHandle={v?.groupChannel?.group}
                                />
                            </div>
                        ))}

                        {/* <MultiVoteInList
                            key={`multi-${v.questionText}`}
                            showGroupAndTime={false}
                            v={v.question}
                            user={v.user}
                            showChart={false}
                        /> */}
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


                {/* <pre>{JSON.stringify(v, null, 2)}</pre> */}

                <hr />
            </>
        );
    }

