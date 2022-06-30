import React, { FunctionComponent, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import numeral from 'numeral';

import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";
import { QUESTION } from '@state/Question/typeDefs';
import { VOTES } from "@state/Vote/typeDefs";
import VoteSortPicker from '@components/shared/VoteSortPicker';
import Notification from '@shared/Notification';
import DropAnimation from '@components/shared/DropAnimation';
import useGroup from '@state/Group/group.effect';
import ListVotersMenu from "./ListVotersMenu";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const ListVoters: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);
    const { questionText, choiceText, groupHandle, subsection, subsubsection } = modalData;

    const [sortBy, setSortBy] = useState('time');

    const { liquidUser } = useAuthUser();
    const { group } = useGroup({ handle: groupHandle });

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText,
            group: groupHandle,
            // channel: groupChannel.channel
        },
        // fetchPolicy: "no-cache"
    });

    const stats = !!choiceText ?
        question_data?.Question?.choices.find(c => c.text === choiceText)?.stats :
        !!questionText ?
            question_data?.Question?.stats :
            group?.stats;

    console.log({
        stats
    });

    const type = (() => {
        if (subsection === 'total' && !subsubsection) {
            return 'all';
        } else if (subsection === 'total' && subsubsection === 'for') {
            return 'for';
        } else if (subsection === 'total' && subsubsection === 'against') {
            return 'against';
        } else if (subsection === 'direct' && !subsubsection) {
            return 'directVotesMade';
        } else if (subsection === 'direct' && subsubsection === 'for') {
            return 'directFor';
        } else if (subsection === 'direct' && subsubsection === 'against') {
            return 'directAgainst';
        } else if (subsection === 'represented' && !subsubsection) {
            return 'indirectVotesMade'
        } else if (subsection === 'direct' && subsubsection === 'byYou') {
            return 'directVotesMadeByYou';
        } else if (subsection === 'represented' && subsubsection === 'byyou') {
            return 'indirectVotesMadeByYou';
        } else if (subsection === 'represented' && subsubsection === 'foryou') {
            return 'indirectVotesMadeForYou';
        }
        return null
    })();

    const {
        loading: votes_loading,
        error: votes_error,
        data: votes_data,
        refetch: votes_refetch
    } = useQuery(VOTES, {
        variables: {
            questionText,
            choiceText,
            groupHandle,
            handleType: 'user',
            type,
            sortBy
        },
        skip: !type
    });

    console.log({
        stats,
        modalData,
        question_data,
        type,
        subsection,
        subsubsection,
        votes_data
    });

    return (
        <>
            <ModalHeader
                title={
                    !!questionText ?
                        `Votes on ${questionText}${!!choiceText ? ": " : ''}${!!choiceText ? choiceText : ''}` :
                        `Votes on ${group?.name}`
                }
                hideSubmitButton={true}
            />
            <div className="">
                <ListVotersMenu
                    subsection={subsection}
                    subsubsection={subsubsection}
                    questionText={questionText}
                    choiceText={choiceText}
                    groupHandle={groupHandle}
                    stats={stats}
                    setSortBy={setSortBy}
                    liquidUser={liquidUser}
                />
            </div>
            <div className="Modal-Content">

                <br />

                {votes_data?.Votes.length === 0 && (
                    <div className="p-4 text-center">
                        {
                            (() => {
                                if (type === 'directFor') {
                                    return 'This poll hasn\'t received any votes in favor yet';
                                } else if (type === 'directAgainst') {
                                    return 'This poll hasn\'t received any votes against yet';
                                } else if (type === 'indirectVotesMade') {
                                    return 'No one has been represented for this poll yet';
                                } else if (type === 'directVotesMadeByYou') {
                                    return 'You  haven\'t voted for this poll yet';
                                } else if (type === 'indirectVotesMadeByYou') {
                                    return 'You haven\'t represented anyone for this poll yet';
                                } else if (type === 'indirectVotesMadeForYou') {
                                    return 'No one has represented you for this poll yet';
                                }
                                return 'type'
                            })()
                        }{' '}
                    </div>
                )}

                <div>
                    {votes_data?.Votes?.map((n, i) => (
                        <Notification
                            key={type + i}
                            v={{
                                ...n,
                            }}
                            showUser={false}
                            showChart={false}
                            hideChoicesBesides={choiceText}
                        />
                    ))}
                </div>

                {votes_loading && (
                    <div className="d-flex justify-content-center mt-5">
                        <DropAnimation />
                    </div>
                )}

                {/* <ul className="position-relative nav d-flex justify-content-around mt-1">
                    <li className="nav-item pointer">
                        <div
                            className={`nav-link ${(modalData?.votersSection === 'forRepresentatives') && 'active'}`}
                            onClick={(e) => {
                                updateParams({
                                    paramsToAdd: {
                                        modalData: JSON.stringify({
                                            ...modalData,
                                            votersSection: 'forRepresentatives'
                                        })
                                    }
                                })
                            }}
                        >
                            <b>{5}</b> Representatives
                        </div>
                    </li>
                    <li className="nav-item pointer">
                        <div
                            className={`nav-link ${(modalData?.votersSection === 'forDirectVoters') && 'active'}`}
                            onClick={(e) => {
                                updateParams({
                                    paramsToAdd: {
                                        modalData: JSON.stringify({
                                            ...modalData,
                                            votersSection: 'forDirectVoters'
                                        })
                                    }
                                })
                            }}
                        >
                            <b>{5}</b> Direct Voters
                        </div>
                    </li>
                    <li className="nav-item pointer">
                        <div
                            className={`nav-link ${(modalData?.votersSection === 'representedVoters') && 'active'}`}
                            onClick={(e) => {
                                updateParams({
                                    paramsToAdd: {
                                        modalData: JSON.stringify({
                                            ...modalData,
                                            votersSection: 'representedVoters'
                                        })
                                    }
                                })
                            }}
                        >
                            <b>{5}</b> Represented Voters
                        </div>
                    </li>
                </ul> */}
                {/* <hr className="mt-n4 mx-0" />

                <br />
                <hr /> */}

                {/* <pre>{JSON.stringify(modalData, null, 2)}</pre>
                <pre>{
                    JSON.stringify({
                        type,
                        votes_loading,
                        votes_data
                    }, null, 2)
                }</pre> */}
                {/* <pre>{JSON.stringify({ stats }, null, 2)}</pre> */}
            </div>

        </>
    );
}

