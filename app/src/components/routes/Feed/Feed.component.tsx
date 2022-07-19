import React, { FunctionComponent, useState } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { QUESTIONS } from "@state/Question/typeDefs";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropAnimation from "@shared/DropAnimation";
import useAuthUser from '@state/AuthUser/authUser.effect';
import VoteSortPicker from '@components/shared/VoteSortPicker';
import PollExplanation from '@shared/PollExplanation';
import useUser from '@state/User/user.effect';
import { useAuth0 } from "@auth0/auth0-react";

import './style.sass';


export const Feed: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();
    const { user: yourUser } = useUser({ userHandle: liquidUser?.handle });
    const { loginWithPopup } = useAuth0();

    // console.log({ yourUser });

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS, {
        variables: {
            sortBy: liquidUser ? 'votersYouFollowOrRepresentingYouTimeWeight' : 'weight',
            notUsers: section === 'other' || !liquidUser,
        },
        skip: !liquidUser || !yourUser?.stats?.following
    });

    // console.log({
    //     liquidUser,
    //     section,
    //     questions_data
    // });

    return (
        <>
            <Header
                title="Following Feed"
            // rightElement={
            //     () => <VoteSortPicker updateSortInParent={setSortBy} initialSort={sortBy} />
            // }
            />

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
                {questions_data?.Questions?.map((v: any, i: any) => (
                    <div key={'feed-poll-' + v?.group?.handle + '-' + v.questionText}>

                        {v?.group?.handle !== questions_data?.Questions[i - 1]?.group?.handle ? (
                            <div className="poll-cover-container">
                                <div
                                    className="poll-cover"
                                    style={{
                                        background: v?.group?.cover && `url(${v?.group?.cover}) 50% 50% / cover no-repeat`
                                    }}
                                />
                                <div className="poll-cover-overlay">
                                </div>
                                <div className="poll-cover-info">
                                    <Link to={`/group/${v?.group?.handle}`}>
                                        <h5 className="white p-0 m-0">
                                            {v?.group?.name}
                                        </h5>
                                    </Link>
                                </div>
                            </div>
                        ) : null}


                        {liquidUser ? (
                            <PollExplanation
                                p={v}
                            />
                        ) : null}

                        {/* <pre className='small'>{JSON.stringify(v?.stats, null, 2)}</pre> */}

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
                ))}

                {!liquidUser && (
                    <div className="p-4 text-center">
                        <h3>Login to see what your friends are voting on</h3>

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
                )}

                {liquidUser && !yourUser?.stats?.following && (
                    <div className="p-4 text-center">
                        <h3>Liquid Vote is more fun with friends.</h3>

                        <p>Follow people to see here what they are voting on.</p>
                    </div>
                )}

                {questions_data?.Questions?.length === 0 && (
                    <div className="p-4 text-center">
                        The people you follow haven't voted yet, at least not in any public groups, or groups you have joined yet
                    </div>
                )}

                {questions_loading && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 mt-n5 flex-column">
                        <DropAnimation />
                        <p className='mt-4'>The Feed Query takes up to 10s for now, sorry 🧪</p>
                    </div>
                )}
            </div>
        </>
    );
}

