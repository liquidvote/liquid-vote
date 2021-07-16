import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";

import useSearchParams from "@state/Global/useSearchParams.effect";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const ListVoters: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const groupChannel = (([g, c]) => ({
        group: g,
        channel: c
    }))(modalData?.groupChannel.split("-"));

    console.log({
        groupChannel,
        modalData
    })
    
    return (
        <>
            <ModalHeader
                title={`Voters`}
                hideSubmitButton={true}
            />

            <ul className="position-relative nav d-flex justify-content-around mt-1">
                <li className="nav-item pointer">
                    <div
                        className={`nav-link ${(modalData?.votersSection === 'forRepresentatives') && 'active'}`}
                        onClick={(e) => {
                            updateParams({
                                paramsToAdd: {
                                    modalData: JSON.stringify({ votersSection: 'forRepresentatives' })
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
                                    modalData: JSON.stringify({ votersSection: 'forDirectVoters' })
                                }
                            })
                        }}
                    >
                        <b>{5}</b> Direct Voters
                    </div>
                </li>
                <li className="nav-item pointer">
                    <div
                        className={`nav-link ${(modalData?.votersSection === 'forRepresentedVoters') && 'active'}`}
                        onClick={(e) => {
                            updateParams({
                                paramsToAdd: {
                                    modalData: JSON.stringify({ votersSection: 'forRepresentedVoters' })
                                }
                            })
                        }}
                    >
                        <b>{5}</b> Represented Voters
                    </div>
                </li>
            </ul>
            <hr className="mt-n4" />

            <br />
            <hr />





            <pre>{JSON.stringify(modalData, null, 2)}</pre>
        </>
    );
}

