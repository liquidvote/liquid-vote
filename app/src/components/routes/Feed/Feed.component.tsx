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

import './style.sass';


export const Feed: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();

    const [sortBy, setSortBy] = useState('time');

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(QUESTIONS, {
        variables: {
            sortBy: liquidUser ? 'votersYouFollowOrRepresentingYouTimeWeight' : 'weight',
            notUsers: section === 'other' || !liquidUser,
        }
        // skip: !liquidUser
    });

    return (
        <>
            <Header
                title="Home"
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
                    <div key={'polls-' + i}>

                        {v?.group?.handle !== questions_data?.Questions[i-1]?.group?.handle ? (
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

                {questions_data?.Questions?.length === 0 && (
                    <div className="p-4 text-center">
                        There are no polls in {section === 'other' ? 'other' : 'your'} groups yet
                    </div>
                )}

                {questions_loading && (
                    <div className="d-flex justify-content-center mt-5">
                        <DropAnimation />
                    </div>
                )}
            </div>
        </>
    );
}

