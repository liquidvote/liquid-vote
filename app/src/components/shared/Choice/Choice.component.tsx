import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";

import { EDIT_VOTE } from '@state/Vote/typeDefs';
import Chart from "@shared/VoteGraph1/chart.svg";
import { voteStatsMap } from '@state/Question/map';
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Choice: FunctionComponent<{
    choiceText?: string,
    voteName: string,
    groupHandle: string,
    stats: any,
    userVote: any,
    inList?: boolean,
    showPercentages?: boolean,
    maxVoteCount?: number
}> = ({
    choiceText,
    voteName,
    groupHandle,
    stats,
    userVote,
    inList,
    showPercentages,
    maxVoteCount
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        const {
            loading: authUser_loading,
            error: authUser_error,
            data: authUser_data,
            refetch: authUser_refetch
        } = useQuery(AUTH_USER);

        const authUser = authUser_data?.authUser?.LiquidUser;

        const [editVote, {
            loading: editVote_loading,
            error: editVote_error,
            data: editVote_data,
        }] = useMutation(EDIT_VOTE);

        const userVote_ = editVote_data ? editVote_data?.editVote?.position : userVote?.position;

        const handleUserVote = (vote: string) => {

            if (!!authUser) {
                editVote({
                    variables: {
                        questionText: voteName,
                        choiceText,
                        group: groupHandle,
                        Vote: {
                            position: (vote === userVote_) ? null : vote
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

        const forRepresentatives = userVote?.representatives?.filter((r: any) => r.position === 'for');
        const againstRepresentatives = userVote?.representatives?.filter((r: any) => r.position === 'against');

        return (
            <div>
                <div className="d-flex d-flex align-items-center mb-1" style={{
                    ...(maxVoteCount) && {
                        'maxWidth':
                            ((stats?.directVotes + stats?.indirectVotes | 0) / maxVoteCount) * 30 + 70 + '%'
                    }
                }}>
                    {!!choiceText && (
                        <div className={`white mr-2 ${inList && 'small'}`}><b>{choiceText}</b></div>
                    )}
                    <Chart
                        name={choiceText || null}
                        forDirectCount={stats_.forDirectCount}
                        forCount={stats_.forCount}
                        againstDirectCount={stats_.againstDirectCount}
                        againstCount={stats_.againstCount}
                        userVote={null}
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
                            className={`button_ justify-content-between min-w mr-1 ${userVote_ === 'for' && 'selected'} ${inList && 'small'}`}
                            onClick={() => handleUserVote('for')}
                        >
                            <span className="mr-1">
                                For
                            </span>
                            {
                                (
                                    !!forRepresentatives?.length &&
                                    userVote?.position === 'delegated' &&
                                    (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                ) && (
                                    <div className="d-flex ml-2 my-n2 mr-n1">
                                        <Link
                                            to={`/profile/${forRepresentatives[0].representativeHandle}`}
                                            onClick={e => e.stopPropagation()}
                                            className={`vote-avatar for ml-n2 ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${forRepresentatives[0].representativeAvatar}) no-repeat`,
                                                backgroundSize: 'cover'
                                            }}
                                        ></Link>
                                        <Link
                                            to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/representingYou`}
                                            onClick={e => e.stopPropagation()}
                                            className={`vote-avatar text-decoration-none count for ml-n2 ${inList && 'tiny'}`}
                                        >{forRepresentatives.length}</Link>
                                    </div>
                                )
                            }
                        </div>
                        <div className="d-flex ml-2">
                            {(
                                !!editVote_data ?
                                    editVote_data?.editVote?.QuestionStats?.forMostRepresentingVoters :
                                    stats?.forMostRepresentingVoters
                            )?.slice(0, 2).map((v: any) => (
                                <Link
                                    key={`forMostRepresentingVoters-${v?.handle}`}
                                    to={`/profile/${v?.handle}`}
                                    className={`vote-avatar for ml-n2 ${inList && 'tiny'}`}
                                    style={{
                                        background: `url(${v?.avatar}) no-repeat`,
                                        backgroundSize: 'cover'
                                    }}
                                ></Link>
                            ))}

                            <Link
                                to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/direct/for`}
                                className={`vote-avatar text-decoration-none count for ml-n2 ${inList && 'tiny'}`}
                            >
                                {numeral(stats_.forCount).format('0a[.]0')}
                            </Link>
                        </div>
                    </div>

                    {editVote_loading && (
                        <img
                            className={`vote-avatar ${inList && 'tiny'}`}
                            src={'http://images.liquid-vote.com/system/loading.gif'}
                        />
                    )}

                    <div className="d-flex align-items-center">
                        <div className="d-flex ml-2">
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
                                            background: `url(${v?.avatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                ))}

                            <Link
                                to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/direct/against`}
                                className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}>
                                {numeral(stats_.againstCount).format('0a[.]0')}
                            </Link>
                        </div>
                        <div
                            className={`button_ min-w justify-content-between text-right ml-1 ${userVote_ === 'against' && 'selected'} ${inList && 'small'}`}
                            onClick={() => handleUserVote('against')}
                        >
                            {
                                (
                                    !!againstRepresentatives?.length &&
                                    userVote?.position === 'delegated' &&
                                    (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                ) && (
                                    <div className="d-flex mr-1 my-n2 ml-1">
                                        <Link
                                            to={`/profile/${againstRepresentatives[0].representativeHandle}`}
                                            className={`vote-avatar against ml-n2 ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${againstRepresentatives[0].representativeAvatar}) no-repeat`,
                                                backgroundSize: 'cover'
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        ></Link>
                                        <Link
                                            to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupHandle}/timeline/representingYou`}
                                            onClick={e => e.stopPropagation()}
                                            className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}
                                        >{againstRepresentatives.length}</Link>
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

