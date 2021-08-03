import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";

import { EDIT_VOTE } from '@state/Vote/typeDefs';
import Chart from "@shared/VoteGraph1/chart.svg";
import { voteStatsMap } from '@state/Question/map';

import './style.sass';

export const Choice: FunctionComponent<{ choice: any, voteName: string, groupChannel: any }> = ({ choice, voteName, groupChannel }) => {

    const [editVote, {
        loading: editVote_loading,
        error: editVote_error,
        data: editVote_data,
    }] = useMutation(EDIT_VOTE);

    const userVote = editVote_data?.editVote?.position || choice?.userVote?.position || null;

    const handleUserVote = (vote: string) => {

        const groupChannel_ = (([g, c]) => ({
            group: g,
            channel: c
        }))(groupChannel.split("-"))

        editVote({
            variables: {
                questionText: voteName,
                choiceText: choice.text,
                group: groupChannel_.group,
                channel: groupChannel_.channel,
                Vote: {
                    position: (vote === userVote) ? null : vote
                },
            }
        });
    }

    const stats = voteStatsMap({
        forCount: choice?.stats?.forCount || 0,
        againstCount: choice?.stats?.againstCount || 0,
        forDirectCount: choice?.stats?.forDirectCount || 0,
        againstDirectCount: choice?.stats?.againstDirectCount || 0,
        // ...(!!editVote_data?.editVote?.QuestionStats) && {
        //     forCount: editVote_data?.editVote?.QuestionStats.forCount,
        //     againstCount: editVote_data?.editVote?.QuestionStats.againstCount,
        //     forDirectCount: editVote_data?.editVote?.QuestionStats.forDirectCount,
        //     againstDirectCount: editVote_data?.editVote?.QuestionStats.againstDirectCount,
        // }
    });

    const forRepresentatives = choice?.userVote?.representatives.filter((r: any) => r.position === 'for');
    const againstRepresentatives = choice?.userVote?.representatives.filter((r: any) => r.position === 'against');

    return (
        <div className="my-4">
            <div className="d-flex d-flex align-items-center mb-1">
                <div className="white mr-2"><b>{choice.text}</b></div>
                <Chart
                    name={choice.text}
                    forDirectCount={stats.forDirectCount}
                    forCount={stats.forCount}
                    againstDirectCount={stats.againstDirectCount}
                    againstCount={stats.againstCount}
                    userVote={null}
                    userDelegatedVotes={null}
                />
            </div>

            {/* <div className="d-flex color-legend mt-2 mb-n2">
                <div>
                    <small>Direct For</small><div className="color forDirect count">{stats?.forDirectPercentage.toFixed(0)}%</div>
                </div>
                <div>
                    <small>Delegated For</small><div className="color for count">{stats?.forDelegatedPercentage.toFixed(0)}%</div>
                </div>
                <div>
                    <small>Direct Against</small><div className="color againstDirect count">{stats?.againstDirectPercentage.toFixed(0)}%</div>
                </div>
                <div>
                    <small>Delegated Against</small><div className="color against count">{stats?.againstDelegatedPercentage.toFixed(0)}%</div>
                </div>
            </div> */}

            <div className="d-flex d-flex justify-content-between mt-1">
                <div className="d-flex align-items-center">
                    <div
                        className={`button_ mr-1 ${userVote === 'for' && 'selected'}`}
                    >
                        <span className="mr-1" onClick={() => handleUserVote('for')}>
                            For
                        </span>
                        {
                            (
                                !!forRepresentatives?.length &&
                                choice.userVote?.position === 'delegated' &&
                                (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                            ) && (
                                <div className="d-flex ml-2 my-n2 mr-n1">
                                    <Link
                                        to={`/profile/${forRepresentatives[0].representativeHandle}`}
                                        className="vote-avatar for ml-n2 d-none d-md-block"
                                        style={{
                                            background: `url(${forRepresentatives[0].representativeAvatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                    <Link
                                        to={`/poll/${voteName}/${groupChannel}/timeline/representingYou`}
                                        className="vote-avatar text-decoration-none count for ml-n2"
                                    >{forRepresentatives.length}</Link>
                                </div>
                            )
                        }
                    </div>


                    {/* <div className="d-flex ml-2">
                            {(
                                editVote_data?.editVote?.QuestionStats?.forMostRepresentingVoters ||
                                choice.stats?.forMostRepresentingVoters
                            )?.slice(0, 2).map((v: any) => (
                                <Link
                                    to={`/profile/${v?.handle}`}
                                    className="vote-avatar for ml-n2 d-none d-md-block"
                                    style={{
                                        background: `url(${v?.avatar}) no-repeat`,
                                        backgroundSize: 'cover'
                                    }}
                                ></Link>
                            ))}

                            <Link
                                to={`/poll/${voteName}/${groupChannel}/timeline/direct/for`}
                                className="vote-avatar text-decoration-none count for ml-n2">{
                                    numeral(stats.forCount).format('0a[.]0')
                                }
                            </Link>
                        </div> */}
                </div>
                <div className="d-flex align-items-center">
                    <div className="d-flex ml-2">
                        {
                            (
                                editVote_data?.editVote?.QuestionStats?.againstMostRepresentingVoters ||
                                choice.stats?.againstMostRepresentingVoters
                            )?.slice(0, 2).map((v: any) => (
                                <Link
                                    to={`/profile/${v?.handle}`}
                                    className="vote-avatar against ml-n2 d-none d-md-block"
                                    style={{
                                        background: `url(${v?.avatar}) no-repeat`,
                                        backgroundSize: 'cover'
                                    }}
                                ></Link>
                            ))}

                        <Link
                            to={`/poll/${voteName}/${groupChannel}/timeline/direct/against`}
                            className="vote-avatar text-decoration-none count against ml-n2">{
                                numeral(stats.againstCount).format('0a[.]0')
                            }
                        </Link>
                    </div>
                    <div
                        className={`button_ ml-1 ${userVote === 'against' && 'selected'}`}
                    >
                        <span onClick={() => handleUserVote('against')}>
                            Against
                        </span>
                        {
                            (
                                !!againstRepresentatives?.length &&
                                choice.userVote?.position === 'delegated' &&
                                (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                            ) && (
                                <div className="d-flex ml-3 my-n2 mr-n1">
                                    <Link
                                        to={`/profile/${againstRepresentatives[0].representativeHandle}`}
                                        className="vote-avatar against ml-n2 d-none d-md-block"
                                        style={{
                                            background: `url(${againstRepresentatives[0].representativeAvatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                    <Link
                                        to={`/poll/${voteName}/${groupChannel}/timeline/representingYou`}
                                        className="vote-avatar text-decoration-none count against ml-n2"
                                    >{againstRepresentatives.length}</Link>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

        </div>
    );
}

