import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";

import { EDIT_VOTE } from '@state/Vote/typeDefs';
import Chart from "@shared/VoteGraph1/chart.svg";
import { voteStatsMap } from '@state/Question/map';
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Choice: FunctionComponent<{
    choiceText?: string,
    voteName: string, // TODO: change to `questionText`
    groupHandle: string,
    stats: any,
    yourVote: any,
    userVote: any,
    inList?: boolean,
    showPercentages?: boolean,
    maxVoteCount?: number,
    user?: any
}> = ({
    choiceText,
    voteName,
    groupHandle,
    stats,
    yourVote,
    userVote,
    inList,
    showPercentages,
    maxVoteCount,
    user
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        const { liquidUser } = useAuthUser();

        const [editVote, {
            loading: editVote_loading,
            error: editVote_error,
            data: editVote_data,
        }] = useMutation(EDIT_VOTE);

        const yourVote_ = editVote_data ? editVote_data?.editVote?.position : yourVote?.position;

        console.log({
            yourVote
        });

        const handleUserVote = (vote: string) => {

            if (!!liquidUser) {
                editVote({
                    variables: {
                        questionText: voteName,
                        choiceText,
                        group: groupHandle,
                        Vote: {
                            position: (vote === yourVote_) ? null : vote
                        },
                    }
                });
            } else {
                updateParams({
                    paramsToAdd: {
                        modal: "RegisterBefore",
                        modalData: JSON.stringify({
                            toWhat: 'vote',
                            questionText: voteName,
                        })
                    }
                })
            }

        }

        const stats_ = voteStatsMap({
            forCount: stats?.forCount || 0,
            againstCount: stats?.againstCount || 0,
            forDirectCount: stats?.forDirectCount || 0,
            againstDirectCount: stats?.againstDirectCount || 0,
            ...(!!editVote_data?.editVote?.QuestionStats) && {
                forCount: editVote_data?.editVote?.QuestionStats.forCount,
                againstCount: editVote_data?.editVote?.QuestionStats.againstCount,
                forDirectCount: editVote_data?.editVote?.QuestionStats.forDirectCount,
                againstDirectCount: editVote_data?.editVote?.QuestionStats.againstDirectCount,
            }
        });

        const forRepresentatives = yourVote?.representatives?.filter((r: any) => r.position === 'for');
        const againstRepresentatives = yourVote?.representatives?.filter((r: any) => r.position === 'against');

        return (
            <div>
                <div
                    className="d-flex d-flex flex-column mb-1"
                // style={{
                //     ...(maxVoteCount) && {
                //         'maxWidth':
                //             ((stats?.directVotes + stats?.indirectVotes | 0) / maxVoteCount) * 30 + 70 + '%'
                //     }
                // }}
                >
                    {!!choiceText && (
                        <div className={`d-flex align-items-center white choice-text mr-2 ${inList && 'small'}`}>
                            <b>{choiceText}</b>
                            {(!!user && !!userVote) && (
                                <div className={`d-flex align-items-center ml-3`}>
                                    {!!userVote.representatives?.length && (
                                        <div className="d-flex on-top">
                                            {userVote.representatives?.map((r: any, i: number) => (
                                                <Link
                                                    data-tip={`${r?.representativeName} representing ${user.name} ${r?.position} `}
                                                    key={`representatives-${r?.representativeHandle || i}`}
                                                    to={`/profile/${r?.representativeHandle}`}
                                                    className={`vote-avatar tiny-big ${r?.position} ml-n2`}
                                                    style={{
                                                        background: `url(${r?.representativeAvatar}) 50% 50% / cover no-repeat`
                                                    }}
                                                ></Link>
                                            ))}
                                            {/* <span className="ml-1 mr-2 pr-1">Representing</span> */}
                                        </div>
                                    )}
                                    <Link
                                        data-tip={
                                            !userVote?.representatives?.length ?
                                                `${user.name} voted ${userVote?.position}` :
                                                `${user.name} represented by ${userVote?.representatives.length === 1 ? userVote.representatives?.[0].representativeName : userVote?.representatives.length}`
                                        }
                                        key={`user-${user.handle}`}
                                        to={`/profile/${user.handle}`}
                                        className={`vote-avatar ${!userVote?.representatives?.length && 'on-top'} ${!!userVote.representatives?.length ? 'tiny' : 'tiny-big'} ${userVote?.position} ml-n2`}
                                        style={{
                                            background: `url(${user.avatar}) 50% 50% / cover no-repeat`
                                        }}
                                    ></Link>
                                    <div className="d-flex" data-tip={`Represented by ${user.name}`}>
                                        {!userVote?.representatives?.length && userVote?.representeeVotes?.map((r: any) => (
                                            <Link
                                                key={`representeeVotes-${r.user.handle}`}
                                                to={`/profile/${r.user.handle}`}
                                                className={`vote-avatar light tiny none ml-n2`}
                                                style={{
                                                    background: `url(${r.user.avatar}) 50% 50% / cover no-repeat`
                                                }}
                                            ></Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* <pre>{JSON.stringify(userVote, null, 2)}</pre> */}
                    <Chart
                        name={choiceText || null}
                        forDirectCount={stats_.forDirectCount}
                        forCount={stats_.forCount}
                        againstDirectCount={stats_.againstDirectCount}
                        againstCount={stats_.againstCount}
                        yourVote={null}
                        userDelegatedVotes={null}
                    />
                </div>

                {showPercentages && (
                    <div className="d-flex color-legend my-3">
                        <div>
                            <small>Direct For</small><div className="color forDirect count">{stats_?.forDirectPercentage.toFixed(0)}%</div>
                        </div>
                        <div>
                            <small>Delegated For</small><div className="color for count">{stats_?.forDelegatedPercentage.toFixed(0)}%</div>
                        </div>
                        <div>
                            <small>Direct Against</small><div className="color againstDirect count">{stats_?.againstDirectPercentage.toFixed(0)}%</div>
                        </div>
                        <div>
                            <small>Delegated Against</small><div className="color against count">{stats_?.againstDelegatedPercentage.toFixed(0)}%</div>
                        </div>
                    </div>
                )}

                <div className="d-flex d-flex justify-content-between mt-1">
                    <div className="d-flex align-items-center">
                        <div
                            className={`button_ justify-content-between min-w mr-1 ${yourVote_ === 'for' && 'selected'} ${inList && 'small'}`}
                            onClick={() => handleUserVote('for')}
                        >
                            <span className="mr-1">
                                For
                            </span>
                            {
                                (
                                    !!forRepresentatives?.length &&
                                    yourVote?.position === 'delegated' &&
                                    (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                ) && (
                                    <div className="d-flex ml-2 my-n2 mr-n1" data-tip={`Representing you`}>
                                        <Link
                                            to={`/profile/${forRepresentatives[0].representativeHandle}`}
                                            onClick={e => e.stopPropagation()}
                                            className={`vote-avatar for ml-n2 ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${forRepresentatives[0].representativeAvatar}) 50% 50% / cover no-repeat`,
                                            }}
                                        ></Link>
                                        <div
                                            onClick={
                                                e => {
                                                    e.stopPropagation();
                                                    updateParams({
                                                        paramsToAdd: {
                                                            modal: "ListVoters",
                                                            modalData: JSON.stringify({
                                                                questionText: voteName,
                                                                choiceText,
                                                                groupHandle,
                                                                subsection: 'direct',
                                                                subsubsection: 'for'
                                                            })
                                                        }
                                                    })
                                                }
                                            }
                                            // to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/representingYou`}
                                            // onClick={e => e.stopPropagation()}
                                            className={`vote-avatar text-decoration-none count for ml-n2 ${inList && 'tiny'}`}
                                        >{forRepresentatives.length}</div>
                                    </div>
                                )
                            }
                        </div>
                        <div className="d-flex ml-2" data-tip={`Votes For`}>
                            {(
                                !!editVote_data ?
                                    editVote_data?.editVote?.QuestionStats?.forMostRepresentingVoters :
                                    stats?.forMostRepresentingVoters
                            )?.slice(0, 2).map((v: any) => (
                                <Link
                                    key={`forMostRepresentingVoters-${v?.handle}`}
                                    to={`/profile/${v?.handle}`}
                                    onClick={e => e.stopPropagation()}
                                    // onClick={
                                    //     e => {
                                    //         e.stopPropagation();
                                    //         updateParams({
                                    //             paramsToAdd: {
                                    //                 modal: "ListVoters",
                                    //                 modalData: JSON.stringify({
                                    //                     questionText: voteName,
                                    //                     choiceText,
                                    //                     groupHandle,
                                    //                     subsection: 'represented',
                                    //                     subsubsection: 'foryou'
                                    //                 })
                                    //             }
                                    //         })
                                    //     }
                                    // }
                                    className={`vote-avatar for ml-n2 ${inList && 'tiny'} pointer`}
                                    style={{
                                        background: `url(${v?.avatar}) 50% 50% / cover no-repeat`
                                    }}
                                ></Link>
                            ))}

                            <div
                                // to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/direct/for`}
                                onClick={
                                    e => {
                                        e.stopPropagation();
                                        updateParams({
                                            paramsToAdd: {
                                                modal: "ListVoters",
                                                modalData: JSON.stringify({
                                                    questionText: voteName,
                                                    choiceText,
                                                    groupHandle,
                                                    subsection: 'direct',
                                                    subsubsection: 'for'
                                                })
                                            }
                                        })
                                    }
                                }
                                className={`pointer vote-avatar text-decoration-none count for ml-n2 ${inList && 'tiny'}`}
                            >
                                {numeral(stats_.forCount).format('0a[.]0')}
                            </div>
                        </div>
                    </div>

                    {editVote_loading && (
                        <img
                            className={`vote-avatar ${inList && 'tiny'}`}
                            src={'http://images.liquid-vote.com/system/loading.gif'}
                        />
                    )}

                    <div className="d-flex align-items-center">
                        <div className="d-flex ml-2" data-tip={`Votes Against`}>
                            {
                                (
                                    !!editVote_data ?
                                        editVote_data?.editVote?.QuestionStats?.againstMostRepresentingVoters :
                                        stats?.againstMostRepresentingVoters
                                )?.slice(0, 2).map((v: any) => (
                                    <Link
                                        key={`againstMostRepresentingVoters-${v?.handle}`}
                                        to={`/profile/${v?.handle}`}
                                        className={`vote-avatar against ml-n2 ${inList && 'tiny'}`}
                                        style={{
                                            background: `url(${v?.avatar}) 50% 50% / cover no-repeat`
                                        }}
                                    ></Link>
                                ))}

                            <div
                                // to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/direct/against`}
                                onClick={
                                    e => {
                                        e.stopPropagation();
                                        updateParams({
                                            paramsToAdd: {
                                                modal: "ListVoters",
                                                modalData: JSON.stringify({
                                                    questionText: voteName,
                                                    choiceText,
                                                    groupHandle,
                                                    subsection: 'direct',
                                                    subsubsection: 'against'
                                                })
                                            }
                                        })
                                    }
                                }
                                className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}>
                                {numeral(stats_.againstCount).format('0a[.]0')}
                            </div>
                        </div>
                        <div
                            className={`button_ min-w justify-content-between text-right ml-1 ${yourVote_ === 'against' && 'selected'} ${inList && 'small'}`}
                            onClick={() => handleUserVote('against')}
                        >
                            {
                                (
                                    !!againstRepresentatives?.length &&
                                    yourVote?.position === 'delegated' &&
                                    (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                ) && (
                                    <div className="d-flex mr-1 my-n2 ml-1" data-tip={`Representing you`}>
                                        <Link
                                            to={`/profile/${againstRepresentatives[0].representativeHandle}`}
                                            className={`vote-avatar against ml-n2 ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${againstRepresentatives[0].representativeAvatar}) 50% 50% / cover no-repeat`
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        ></Link>
                                        <div
                                            // to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/representingYou`}
                                            onClick={
                                                e => {
                                                    e.stopPropagation();
                                                    updateParams({
                                                        paramsToAdd: {
                                                            modal: "ListVoters",
                                                            modalData: JSON.stringify({
                                                                questionText: voteName,
                                                                choiceText,
                                                                groupHandle,
                                                                subsection: 'represented',
                                                                subsubsection: 'foryou'
                                                            })
                                                        }
                                                    })
                                                }
                                            }
                                            className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}
                                        >{againstRepresentatives.length}</div>
                                    </div>
                                )
                            }
                            <span>
                                Against
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

