import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import { USER_QUESTIONS } from "@state/User/typeDefs";
import SingleVoteInList from "@shared/SingleVoteInList";
import MultiVoteInList from "@shared/MultiVoteInList";
import DropAnimation from "@components/shared/DropAnimation";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';


export const Feed: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();

    const {
        loading: questions_loading,
        error: questions_error,
        data: questions_data,
        refetch: questions_refetch
    } = useQuery(USER_QUESTIONS, {
        variables: {
            handle: liquidUser?.handle || null,
            sortBy: 'time',
            notUsers: section === 'other'
        }
        // skip: !liquidUser
    });

    return (
        <>
            <Header title="Home" />

            {
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
                    </ul>
                )
            }

            <div className="mt-3">
                {questions_data?.UserQuestions?.map((v: any, i: any) => (
                    <div key={'polls-' + i}>
                        {v.questionType === 'multi' && (
                            <MultiVoteInList
                                key={`multi-${v.questionText}`}
                                v={v}
                            />
                        )}
                        {v.questionType === 'single' && (
                            <SingleVoteInList
                                key={`single-${v.questionText}`}
                                l={v}
                                showGroupAndTime={true}
                                showIntroMessage={true}
                            />
                        )}
                        <hr />
                    </div>
                ))}

                {questions_data?.UserQuestions?.length === 0 && (
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

