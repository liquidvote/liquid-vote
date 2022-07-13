import React, { FunctionComponent } from 'react';
import numeral from 'numeral';

import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const ListVotersMenu: FunctionComponent<{
    subsection?: any
    subsubsection?: any
    questionText?: any
    choiceText?: any
    groupHandle?: any
    stats?: any
    yourStats?: any
    setSortBy?: any
    liquidUser?: any
    followsOnly?: any
}> = ({
    subsection,
    subsubsection,
    questionText,
    choiceText,
    groupHandle,
    stats,
    yourStats,
    setSortBy,
    liquidUser,
    followsOnly
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        return (
            <>
                <ul className="mt-1 nav d-flex justify-content-around">
                    <li className="nav-item">
                        <div
                            className={`pointer nav-link active`}
                        >
                            <b>{numeral(
                                (stats?.directVotes)
                                +
                                (stats?.indirectVotes)
                            ).format('0a[.]0')}</b> Votes
                        </div>
                    </li>
                </ul>
                <ul className="mt-1 nav d-flex justify-content-around">
                    <li className="nav-item">
                        <div
                            className={`pointer nav-link ${(!subsection || subsection === 'direct') && 'active'}`}
                            // to={`/poll/${questionText}/${groupHandle}/timeline`}
                            onClick={
                                e => {
                                    e.stopPropagation();
                                    updateParams({
                                        paramsToAdd: {
                                            modal: "ListVoters",
                                            modalData: JSON.stringify({
                                                questionText,
                                                choiceText,
                                                groupHandle,
                                                subsection: 'direct',
                                                // subsubsection: 'foryou'
                                            })
                                        }
                                    })
                                }
                            }
                        >
                            <b>{numeral(stats?.directVotes || stats?.directVotesMade).format('0a[.]0')}</b> Direct
                        </div>
                    </li>
                    <li className="nav-item">
                        <div
                            className={`small pointer nav-link ${(subsection === 'represented') && 'active'}`}
                            // to={`/poll/${questionText}/${groupHandle}/timeline/represented`}
                            onClick={
                                e => {
                                    e.stopPropagation();
                                    updateParams({
                                        paramsToAdd: {
                                            modal: "ListVoters",
                                            modalData: JSON.stringify({
                                                questionText,
                                                choiceText,
                                                groupHandle,
                                                subsection: 'represented',
                                                // subsubsection: 'foryou'
                                            })
                                        }
                                    })
                                }
                            }
                        >
                            <b>{numeral(stats?.indirectVotes || stats?.indirectVotesMade).format('0a[.]0')}</b> Represented <b>(🧪)</b>
                        </div>
                    </li>
                </ul>

                <hr className="mt-n4 mx-0 mb-0" />

                {(!!questionText && (!subsection || subsection === 'total')) && (
                    <>
                        <ul className="nav d-flex justify-content-around">
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${(!subsubsection) && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/for`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'all'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="px-1 rounded">{
                                        numeral((stats?.directVotes + stats?.indirectVotes) || 0).format('0a[.]0')
                                    }</b> All
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${(subsubsection === 'for') && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/for`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'total',
                                                        subsubsection: 'for'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="forDirect white px-1 rounded">{
                                        numeral((stats?.forCount) || 0).format('0a[.]0')
                                    }</b> Yay
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${(subsubsection === 'against') && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/against`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'total',
                                                        subsubsection: 'against'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="againstDirect white px-1 rounded">{
                                        numeral((stats?.againstCount) || 0).format('0a[.]0')
                                    }</b> Nay
                                </div>
                            </li>
                        </ul>
                        <hr className="mt-n4 mb-0 mx-0" />
                    </>
                )}

                {(!!questionText && (!subsection || subsection === 'direct')) && (
                    <>
                        <ul className="nav d-flex justify-content-around">
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${((!subsubsection || subsubsection === 'all') && followsOnly) && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/for`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'direct',
                                                        subsubsection: 'all',
                                                        followsOnly: true
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="px-1 rounded">{numeral(yourStats?.votersYouFollowCount).format('0a[.]0')}</b> By Follows
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${(subsubsection === 'for') && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/for`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'direct',
                                                        subsubsection: 'for'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="forDirect white px-1 rounded">{numeral(stats?.forDirectCount).format('0a[.]0')}</b> Yay
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`pointer nav-link ${(subsubsection === 'against') && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/direct/against`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'direct',
                                                        subsubsection: 'against'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b className="againstDirect white px-1 rounded">{numeral(stats?.againstDirectCount).format('0a[.]0')}</b> Nay
                                </div>
                            </li>
                        </ul>
                        <hr className="mt-n4 mb-0 mx-0" />
                    </>
                )}

                {!!liquidUser && subsection === 'represented' && (
                    <>
                        <ul className="nav d-flex justify-content-around">
                            <li className="nav-item">
                                <div
                                    className={`small pointer nav-link ${!subsubsection && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/represented`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'represented',
                                                        // subsubsection: 'foryou'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b>{numeral(stats?.indirectVotes).format('0a[.]0')}</b> By anyone
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`small pointer nav-link ${subsubsection === 'byyou' && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/represented/byyou`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'represented',
                                                        subsubsection: 'byyou'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    {/* <b>{profile?.yourStats?.indirectVotesMadeByYou}</b> */}
                                    By you
                                    {/* <b>(🧪)</b> */}
                                </div>
                            </li>
                            <li className="nav-item">
                                <div
                                    className={`small pointer nav-link ${subsubsection === 'foryou' && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/represented/foryou`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'represented',
                                                        subsubsection: 'foryou'
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <b>{yourStats?.votersRepresentingYouCount}</b>
                                    For you
                                </div>
                            </li>
                            {/* <li className="nav-item">
                                <div
                                    className={`small pointer nav-link ${subsubsection === 'represented' && subsubsection === 'byFollows' && 'active'}`}
                                    // to={`/poll/${questionText}/${groupHandle}/timeline/represented/foryou`}
                                    onClick={
                                        e => {
                                            e.stopPropagation();
                                            updateParams({
                                                paramsToAdd: {
                                                    modal: "ListVoters",
                                                    modalData: JSON.stringify({
                                                        questionText,
                                                        choiceText,
                                                        groupHandle,
                                                        subsection: 'represented',
                                                        subsubsection: 'byFollows',
                                                        followsOnly: true
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    
                                    🧪
                                    By Follows
                                </div>
                            </li> */}
                        </ul>
                        <hr className="mt-n4 mb-0 mx-0" />
                    </>
                )}

            </>
        );
    }

