import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import Avatar from "@components/shared/Avatar";
import useUser from '@state/User/user.effect';
import { timeAgo } from '@state/TimeAgo';

import './style.sass';

export const Notification: FunctionComponent<{
    user: any,
    type:
    'voted_on_a_poll_you_voted' |
    'followed_you' |
    'invited_you_to_vote_on_a_poll' |
    'voted_on_a_poll' |
    'invited_you_to_join_group',

    question: any,
    choiceText: string,
    group: any,
    agreesWithYou: any,
    when: string,
    seen: boolean
}> = ({
    user,
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

                    {user ? (
                        <Link to={`/profile/${user?.handle}`}>
                            <Avatar
                                person={user}
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
                                {user ? (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Link to={`/profile/${user?.handle}`} className="d-block">
                                            <b className="mr-1">{user?.name}</b>
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
                                            <small className="d-inline-block mr-1">
                                                {type === 'voted_on_a_poll_you_voted' ? (
                                                    <>
                                                        {agreesWithYou ? (
                                                            <b className="forDirect white px-1 rounded">Agreed</b>
                                                        ) : (
                                                            <b className="againstDirect white px-1 rounded">Disagreed</b>
                                                        )}
                                                        {' '}
                                                        {/* or
                                                    <b className="againstDirect white px-1 rounded">disagrees</b> */}
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
                                                {type === 'voted_on_a_poll' ? (
                                                    <>
                                                        Voted on
                                                        {' '}
                                                        <Link
                                                            to={`/${question?.questionType === 'single' ? 'poll' : 'multipoll'}/${question?.questionText}/${group?.handle}`}
                                                        >
                                                            <b className="white">{question?.questionText}{choiceText ? `: ${choiceText}` : ''}</b>
                                                        </Link>
                                                    </>
                                                ) : null}
                                                {type === 'invited_you_to_join_group' ? (
                                                    <>
                                                        Invited you to join
                                                        {' '}
                                                        <Link to={`/group/${group?.handle}`}><b className="white">{group?.name}</b></Link>
                                                    </>
                                                ) : null}
                                            </small>
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

