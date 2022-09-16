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
import InviteSvg from "@shared/Icons/Invite.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import GroupSvg from "@shared/Icons/Group-plus.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";


import './style.sass';

export const Feed: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();
    const { user: yourUser, user_loading: yourUser_loading } = useUser({ userHandle: liquidUser?.handle });
    const { loginWithPopup, isLoading: auth0_loading, isAuthenticated } = useAuth0();
    const { allSearchParams, updateParams } = useSearchParams();

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

    console.log({ yourUser });

    return (
        <>
            <MetaTags
                title="Liquid Vote - Where opinions are found"
                description="Liquid Vote is a voting platform where opinions are communicated through polls from friends or experts on any topic."
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

                            {v?.group?.handle !== questions_data?.Questions[i + 1]?.group?.handle ? (
                                <>
                                    <br />
                                    <br />
                                </>
                            ) : null}
                            <hr />
                        </div>
                    </>
                ))}

                {(!liquidUser && !isAuthenticated) && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
                        <div className="p-4 text-center">
                            <h3>Welcome to <b className='white'>Liquid Vote</b>!</h3>

                            <p className='feed-about'>Where we vote with friends and experts, on any topic.</p>

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

                            <p className='feed-about'>Follow some to see what they are voting on.</p>
                        </div>

                        {
                            yourUser?.stats?.followedBy ? (
                                <>
                                    <hr className='w-100 mx-5' />

                                    <div className='mt-5'>
                                        <div className="question-title-in-list mt-0 white line-height-24">
                                            <b className='white mx-1'>{yourUser?.stats?.followedBy}</b> voter{yourUser?.stats?.followedBy > 1 ? 's' : null} follow{yourUser?.stats?.followedBy > 1 ? null : 's'} you
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <Link to={`/profile-follows/${liquidUser.handle}/following`} className="button_ mt-4">
                                                Visit them
                                            </Link>
                                        </div>

                                        <br />
                                    </div>
                                </>
                            ) : null
                        }

                        {
                            !yourUser?.stats?.followedBy ? (
                                <>
                                    <hr className='w-100 mx-5' />

                                    <div className='mt-5'>
                                        <div className="question-title-in-list mt-0 white line-height-24">
                                            No friend's here yet? Vote with us then!    
                                        </div>

                                        <div className="d-flex justify-content-between mt-4">
                                            <Link to={`/invite/by/buesimples/toCompareWith/buesimples`} className="button_">
                                                Vote with Pedro
                                            </Link>
                                            <Link to={`/invite/by/yuriwentink/toCompareWith/yuriwentink`} className="button_">
                                                Vote with Yuri
                                            </Link>
                                        </div>

                                        <br />
                                    </div>
                                </>
                            ) : null
                        }


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
            {/* <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="question-title-in-list mt-0 white line-height-24">Compare with voters you haven't noticed yet</div>

                    <div className="d-flex justify-content-center">
                        <div className={`button_ active`}>
                            Visit them
                        </div>
                    </div>
                </div>

                <hr />
                <br />
            </div> */}

            {/* Invite other's to compare with Followings - if Following(s) have <5 followers */}
            {yourUser?.stats?.following ? (
                <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="question-title-in-list mt-0 white line-height-24">Invite others to compare with your <b className='white mx-1'>{yourUser?.stats?.following}</b> follows</div>

                        <div className="d-flex flex-column align-items-center justify-content-center">
                            <Link to={`/profile-follows/${liquidUser.handle}/followedby`} className="button_">
                                Visit them
                            </Link>
                        </div>
                    </div>

                    <hr />
                    <br />
                </div>
            ) : null}
            {/* Invite Followings to vote on Causes you've voted but they haven't */}
            {/* <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="question-title-in-list mt-0 white line-height-24">Invite others to compare with your <b className='white mx-1'>3</b> votes</div>

                    <div className="d-flex justify-content-center">
                        <div className={`button_ active`}>
                            <b className="white mr-4 ml-1 mt-n1">
                                <InviteSvg />
                            </b>
                            Share Invite
                        </div>
                    </div>

                </div>

                <hr />
                <br />
            </div> */}
            {/* Be the first of your friends to vote on new Causes */}
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="question-title-in-list mt-0 white line-height-24">Find new Causes</div>

                    <div className="d-flex justify-content-center">
                        <Link to={`/groups/other`} className="button_">
                            Visit them
                        </Link>
                    </div>

                </div>

                <hr />
                <br />
            </div>
            {/* Launch a new poll in one of your Causes */}
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="question-title-in-list mt-0 white line-height-24">Launch a new poll</div>

                    <div className="d-flex justify-content-center">
                        <div
                            className={`button_ active ml-5`}
                            onClick={() => liquidUser ? updateParams({
                                paramsToAdd: {
                                    modal: "EditQuestion",
                                    modalData: JSON.stringify({
                                        questionText: 'new'
                                    })
                                }
                            }) : updateParams({
                                paramsToAdd: {
                                    modal: "RegisterBefore",
                                    modalData: JSON.stringify({
                                        toWhat: 'launchPoll'
                                    })
                                }
                            })}
                        >
                            Launch poll
                            {/* <b className="white mx-2 mt-n1">
                                <DropPlusSVG />
                            </b> */}
                        </div>
                    </div>

                </div>

                <hr />
                <br />
            </div>
            {/* Launch a new Cause */}
            <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="question-title-in-list mt-0 white line-height-24 ">Launch a new cause</div>

                    <div className="d-flex justify-content-center">
                        <div
                            className={`button_ active`}
                            onClick={() => liquidUser ? updateParams({
                                paramsToAdd: {
                                    modal: 'EditGroup',
                                    modalData: JSON.stringify({ groupHandle: 'new' })
                                }
                            }) : updateParams({
                                paramsToAdd: {
                                    modal: "RegisterBefore",
                                    modalData: JSON.stringify({
                                        toWhat: 'createGroup'
                                    })
                                }
                            })}
                        >
                            Launch cause
                            {/* <b className="white mx-2 mt-n1">
                                <GroupSvg />
                            </b> */}
                        </div>
                    </div>

                </div>

                <hr />
                <br />
            </div>

        </>
    );
}

