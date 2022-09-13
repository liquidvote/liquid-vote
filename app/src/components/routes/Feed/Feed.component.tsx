import React, { FunctionComponent, useState, useEffect } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Header from "@shared/Header";
import { QUESTIONS } from "@state/Question/typeDefs";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropAnimation from "@shared/DropAnimation";
import useAuthUser from '@state/AuthUser/authUser.effect';
import VoteSortPicker from '@components/shared/VoteSortPicker';
import PollExplanation from '@shared/PollExplanation';
import useUser from '@state/User/user.effect';
import GroupPollListCover from "@shared/GroupPollListCover";
import MetaTags from "@components/shared/MetaTags";

import './style.sass';

export const Feed: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();
    const { user: yourUser, user_loading: yourUser_loading } = useUser({ userHandle: liquidUser?.handle });
    const { loginWithPopup, isLoading: auth0_loading, isAuthenticated } = useAuth0();

    const loadingMessages = [
        'gathering all the votes',
        'confirming the count is reliable',
        'ups, it wasn\'t, counting again..',
        'apparently someone wanted to count votes remotely and took a vote box',
        'which makes no sense at all. since no one here counts votes.',
        'the computer does that, but she\'s still new at this',
        'yes, our computer has a gender, and we\'re proud of her',
    ];

    const [selectedLoadingMessage, setSelectedLoadingMessage] = useState(0);

    useEffect(() => {
        if (isAuthenticated && selectedLoadingMessage < (loadingMessages.length - 1)) {
            setTimeout(() => setSelectedLoadingMessage(selectedLoadingMessage + 1), 1500 + selectedLoadingMessage * 300);
        }
    }, [selectedLoadingMessage, isAuthenticated]);

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS, {
        variables: {
            sortBy: liquidUser ? 'votersYouFollowOrRepresentingYouTimeWeight' : 'weight',
            notUsers: section === 'other' || !liquidUser,
            // groupHandle: null
        },
        skip: !liquidUser
    });

    return (
        <>
            <MetaTags
                title="Liquid Vote - Where opinions are found"
                description="Liquid Vote is an open platform where users express opinions through polls launched by friends or experts on any topic."
                image="https://images.liquid-vote.com/system/logo.png"
            />
            {/* <Header
                title="Feed"
                // subtitle="Polls from groups you've joined that people you follow have recently voted on"
                // rightElement={
                //     () => <VoteSortPicker updateSortInParent={setSortBy} initialSort={sortBy} />
                // }
            /> */}

            {/* {
                !!liquidUser && (
                    <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
                        <li className="nav-item">
                            <Link className={`nav-link ${!section && 'active'}`} to={`/home`}>
                                Polls from your Groups
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${section === 'other' && 'active'}`} to={`/home/other`}>
                                Other
                            </Link>
                        </li>
                        <li className="px-4 mt-1">
                            <VoteSortPicker updateSortInParent={setSortBy} initialSort={sortBy} />
                        </li>
                    </ul>
                )
            } */}

            <div className="mt-3">
                {yourUser?.stats?.following > 0 && questions_data?.Questions?.map((v: any, i: any) => (
                    <>
                        {v?.group?.handle !== questions_data?.Questions[i - 1]?.group?.handle ? (
                            <GroupPollListCover
                                group={v?.group}
                                key={'poll-cover' + v?.group?.handle + '-' + v.questionText}
                            />
                        ) : null}
                        <div key={'feed-poll-' + v?.group?.handle + '-' + v.questionText}>

                            {liquidUser ? (
                                <PollExplanation
                                    p={v}
                                />
                            ) : null}

                            {v.questionType === 'multi' && (
                                <MultiVoteInList
                                    key={`multi-${v.questionText}`}
                                    v={v}
                                    showGroupAndTime={true}
                                />
                            )}
                            {v.questionType === 'single' && (
                                <SingleVoteInList
                                    key={`single-${v.questionText}`}
                                    l={v}
                                    showGroupAndTime={true}
                                />
                            )}
                            <hr />
                        </div>
                    </>
                ))}

                {(!liquidUser && !isAuthenticated) && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                        <div className="p-4 text-center">
                            <h3>Welcome to <b className='white'>Liquid Vote</b>!</h3>

                            <p>Login to vote with your friends and the world around you.</p>

                            <div className="d-flex align-items-center justify-content-center">
                                <div
                                    className="button_ mx-5 my-4"
                                    onClick={loginWithPopup}
                                >
                                    Log In
                                </div>
                                or
                                <div
                                    className="button_ mx-5 my-4"
                                    onClick={loginWithPopup}
                                >
                                    Sign Up
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(liquidUser && yourUser && !yourUser?.stats?.following && !questions_loading) && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                        <div className="p-4 text-center">
                            <h3><b className='white'>Liquid Vote</b> is more fun with friends.</h3>

                            <p>Follow some to see what they are voting on.</p>
                        </div>
                    </div>
                )}

                {(questions_data?.Questions?.length === 0 && !questions_loading && liquidUser) && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                        <div className="p-4 text-center">
                            The people you follow haven't voted yet, at least not in any public groups, or groups you have joined yet
                        </div>
                    </div>
                )}

                {(questions_loading || yourUser_loading || (isAuthenticated && !liquidUser)) && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                        <DropAnimation />
                        <p className='mt-4 text-center px-5'>{loadingMessages[selectedLoadingMessage]}</p>
                    </div>
                )}
            </div>


            {/* Feed Engagement Primers */}
            {/* Follow your Followers's Follows - if you have <5 followers */}
            {/* Invite other's to compare with Followings - if Following(s) have <5 followers */}
            {/* Invite Followings to vote on Causes you've voted but they haven't */}
            {/* Be the first of your friends to vote on new Causes */}
            {/* Launch a new poll in one of your Causes */}
            {/* Launch a new Cause */}

        </>
    );
}

