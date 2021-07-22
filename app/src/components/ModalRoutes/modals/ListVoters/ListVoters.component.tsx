import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import useSearchParams from "@state/Global/useSearchParams.effect";
import { QUESTION, QUESTION_VOTERS } from '@state/Question/typeDefs';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const ListVoters: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const groupChannel = (([g, c]) => ({
        group: g,
        channel: c
    }))(modalData?.groupChannel.split("-"));

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: modalData.questionText,
            group: groupChannel.group,
            channel: groupChannel.channel
        }
    });

    const {
        loading: question_voters_loading,
        error: question_voters_error,
        data: question_voters_data,
        refetch: question_voters_refetch
    } = useQuery(QUESTION_VOTERS, {
        variables: {
            questionText: modalData.questionText,
            group: groupChannel.group,
            channel: groupChannel.channel,
            typeOfVoter: modalData?.votersSection
        },
        skip: !(modalData?.votersSection === 'directFor' || modalData?.votersSection === 'directAgainst')
    });

    console.log({
        groupChannel,
        modalData,
        question_data,
        question_voters_data
    });

    return (
        <>
            <ModalHeader
                title={`Voters`}
                hideSubmitButton={true}
            />

            <ul className="position-relative nav d-flex justify-content-around mt-1">
                <li className="nav-item pointer">
                    <div
                        className={`nav-link ${(modalData?.votersSection === 'directFor') && 'active'}`}
                        onClick={(e) => {
                            updateParams({
                                paramsToAdd: {
                                    modalData: JSON.stringify({
                                        ...modalData,
                                        votersSection: 'directFor'
                                    })
                                }
                            })
                        }}
                    >
                        <b>{5}</b> Direct For
                    </div>
                </li>
                <li className="nav-item pointer">
                    <div
                        className={`nav-link ${(modalData?.votersSection === 'directAgainst') && 'active'}`}
                        onClick={(e) => {
                            updateParams({
                                paramsToAdd: {
                                    modalData: JSON.stringify({
                                        ...modalData,
                                        votersSection: 'directAgainst'
                                    })
                                }
                            })
                        }}
                    >
                        <b>{5}</b> Direct Against
                    </div>
                </li>
                <li className="nav-item pointer">
                    <div
                        className={`nav-link ${(modalData?.votersSection === 'representingYou') && 'active'}`}
                        onClick={(e) => {
                            updateParams({
                                paramsToAdd: {
                                    modalData: JSON.stringify({
                                        ...modalData,
                                        votersSection: 'representingYou'
                                    })
                                }
                            })
                        }}
                    >
                        <b>{5}</b> Representing you
                    </div>
                </li>
            </ul>

            <hr className="mt-n4" />

            {
                modalData?.votersSection === 'direct' || modalData?.votersSection === 'represented' && (
                    <ul className="position-relative nav d-flex justify-content-around mt-1">
                        <li className="nav-item pointer">
                            <div
                                className={`nav-link ${(modalData?.votersSubSection === 'for') && 'active'}`}
                                onClick={(e) => {
                                    updateParams({
                                        paramsToAdd: {
                                            modalData: JSON.stringify({
                                                ...modalData,
                                                votersSubSection: 'forRepresentatives'
                                            })
                                        }
                                    })
                                }}
                            >
                                <b>{5}</b> For
                            </div>
                        </li>
                        <li className="nav-item pointer">
                            <div
                                className={`nav-link ${(modalData?.votersSubSection === 'against') && 'active'}`}
                                onClick={(e) => {
                                    updateParams({
                                        paramsToAdd: {
                                            modalData: JSON.stringify({
                                                ...modalData,
                                                votersSection: 'against'
                                            })
                                        }
                                    })
                                }}
                            >
                                <b>{5}</b> Against
                            </div>
                        </li>
                    </ul>
                )
            }

            {
                modalData?.votersSection === 'you' && (
                    <ul className="position-relative nav d-flex justify-content-around mt-1">
                        <li className="nav-item pointer">
                            <div
                                className={`nav-link ${(modalData?.votersSubSection === 'byYou') && 'active'}`}
                                onClick={(e) => {
                                    updateParams({
                                        paramsToAdd: {
                                            modalData: JSON.stringify({
                                                ...modalData,
                                                votersSubSection: 'byYou'
                                            })
                                        }
                                    })
                                }}
                            >
                                <b>{5}</b> By You
                            </div>
                        </li>
                        <li className="nav-item pointer">
                            <div
                                className={`nav-link ${(modalData?.votersSubSection === 'forYou') && 'active'}`}
                                onClick={(e) => {
                                    updateParams({
                                        paramsToAdd: {
                                            modalData: JSON.stringify({
                                                ...modalData,
                                                votersSection: 'forYou'
                                            })
                                        }
                                    })
                                }}
                            >
                                <b>{5}</b> For You
                            </div>
                        </li>
                    </ul>
                )
            }

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
            <hr className="mt-n4" />

            <br />
            <hr />





            <pre>{JSON.stringify(modalData, null, 2)}</pre>
            <pre>{JSON.stringify(question_voters_data, null, 2)}</pre>
        </>
    );
}

