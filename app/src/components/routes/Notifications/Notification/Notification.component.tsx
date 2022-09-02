import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Avatar from "@components/shared/Avatar";
import useUser from '@state/User/user.effect';
import { timeAgo } from '@state/TimeAgo';

import './style.sass';

export const Notification: FunctionComponent<{
    actionUser: any,
    user?: any,
    inviterUser?: any,
    liquidUserHandle?: string,
    type:
        'voted_on_a_poll_you_voted' |
        'followed_you' |
        'invited_you_to_vote_on_a_poll' |
        'voted_on_a_poll' |
        'invited_you_to_vote_on_group' |
        'invited_you_to_vote_on_profile',
    question: any,
    choiceText: string,
    group: any,
    agreesWithYou: any,
    when: string,
    seen: boolean
}> = ({
    actionUser,
    user,
    inviterUser,
    liquidUserHandle,
    type,
    question,
    choiceText,
    group,
    agreesWithYou,
    when,
    seen
}) => {
        return (
            <>
                <div className={`d-flex relative align-items-center notification ${!seen ? 'not-seen' : null}`}>

                    {actionUser ? (
                        <Link to={`/profile/${actionUser?.handle}`}>
                            <Avatar
                                person={actionUser}
                                // groupHandle={groupChannel?.group}
                                type="small"
                            />
                        </Link>
                    ) : (
                        <Avatar
                            person={null}
                            groupHandle={null}
                            type="small"
                        />
                    )}

                    <div className="flex-fill">
                        <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                            <div className="w-100">
                                {actionUser ? (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Link to={`/profile/${actionUser?.handle}`} className="d-block">
                                            <b className="mr-1">{actionUser?.name}</b>
                                        </Link>

                                        <div className="d-flex ml-1">
                                            {/* right side CTAs could go here */}
                                        </div>
                                    </div>

                                ) : (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <b className="mr-1">Anonymous</b>
                                    </div>
                                )}

                                <div className="d-flex align-items-center mt-0 mb-0 w-100">
                                    <div className='d-flex align-items-center justify-content-between w-100'>
                                        <div className="d-flex align-items-center">



                                            {/* TODO: Move to server  */}
                                            <small className="d-inline-block mr-1">
                                                {type === 'voted_on_a_poll_you_voted' ? (
                                                    <>
                                                        {agreesWithYou ? (
                                                            <b className="forDirect white px-1 rounded">Agreed</b>
                                                        ) : (
                                                            <b className="againstDirect white px-1 rounded">Disagreed</b>
                                                        )}
                                                        {' '}
                                                        with you on
                                                        {' '}
                                                        <Link
                                                            to={`/${question?.questionType === 'single' ? 'poll' : 'multipoll'}/${question?.questionText}/${group?.handle}`}
                                                        >
                                                            <b className="white">{question?.questionText}{choiceText ? `: ${choiceText}` : ''}</b>
                                                        </Link>
                                                    </>
                                                ) : null}
                                                {type === 'followed_you' ? (
                                                    <>
                                                        Followed you
                                                    </>
                                                ) : null}
                                                {type === 'voted_on_a_poll' ? (
                                                    <>
                                                        Voted on
                                                        {' '}
                                                        <Link
                                                            to={`/${question?.questionType === 'single' ? 'poll' : 'multipoll'}/${question?.questionText}/${group?.handle}`}
                                                        >
                                                            <b className="white">{question?.questionText}{choiceText ? `: ${choiceText}` : ''}</b>
                                                        </Link>
                                                        {inviterUser?.handle === liquidUserHandle ? (
                                                            <>
                                                                {' '}
                                                                <small>
                                                                    by your invite
                                                                    {(typeof agreesWithYou !== undefined ?
                                                                        <>
                                                                            {', '}
                                                                            {agreesWithYou ? (
                                                                                <b className="forDirect white px-1 rounded">Agreeing</b>
                                                                            ) : (
                                                                                <b className="againstDirect white px-1 rounded">Disagreeing</b>
                                                                            )}
                                                                            {' '}
                                                                            with you
                                                                        </> : null
                                                                    )}
                                                                </small>
                                                            </>
                                                        ) : null}
                                                    </>
                                                ) : null}
                                                {type === 'invited_you_to_vote_on_a_poll' ? (
                                                    <>
                                                        Invited you to vote on
                                                        {' '}
                                                        <Link
                                                            to={`/${question?.questionType === 'single' ? 'poll' : 'multipoll'}/${question?.questionText}/${group?.handle}`}
                                                        >
                                                            <b className="white">{question?.questionText}</b>
                                                        </Link>
                                                    </>
                                                ) : null}
                                                {type === 'invited_you_to_vote_on_profile' ? (
                                                    <>
                                                        Invited you to vote with
                                                        {' '}
                                                        <Link to={`/profile/${user?.handle}`}>
                                                            {user?.handle !== actionUser?.handle ? (
                                                                <b className="white">{user?.name}</b>
                                                            ) : <b className="white">him</b>}
                                                        </Link>
                                                    </>
                                                ) : null}
                                                {type === 'invited_you_to_vote_on_group' ? (
                                                    <>
                                                        Invited you to vote on
                                                        {' '}
                                                        <Link to={`/group/${group?.handle}`}><b className="white">{group?.name}</b></Link>
                                                    </>
                                                ) : null}
                                            </small>
                                            {/*  */}




                                        </div>

                                        <small className='faded'>
                                            {when ?
                                                timeAgo.format(
                                                    new Date(Number(when))
                                                ) :
                                                null
                                            }
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr />
            </>
        );
    }

