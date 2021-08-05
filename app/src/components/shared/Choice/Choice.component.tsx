import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import numeral from 'numeral';
import { useQuery, useMutation } from "@apollo/client";

import { EDIT_VOTE } from '@state/Vote/typeDefs';
import Chart from "@shared/VoteGraph1/chart.svg";
import { voteStatsMap } from '@state/Question/map';

import './style.sass';

export const Choice: FunctionComponent<{
    choiceText?: string, voteName: string, groupChannel: any, stats: any, userVote: any, inList?: boolean
}> = ({
    choiceText, voteName, groupChannel, stats, userVote, inList
}) => {

        const [editVote, {
            loading: editVote_loading,
            error: editVote_error,
            data: editVote_data,
        }] = useMutation(EDIT_VOTE);

        const userVote_ = editVote_data?.editVote?.position || userVote?.position || null;

        const handleUserVote = (vote: string) => {

            const groupChannel_ = (([g, c]) => ({
                group: g,
                channel: c
            }))(groupChannel.split("-"))

            editVote({
                variables: {
                    questionText: voteName,
                    choiceText,
                    group: groupChannel_.group,
                    channel: groupChannel_.channel,
                    Vote: {
                        position: (vote === userVote_) ? null : vote
                    },
                }
            });
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
                <div className="d-flex d-flex align-items-center mb-1">
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

                <div className="d-flex d-flex justify-content-between mt-1">
                    <div className="d-flex align-items-center">
                        <div
                            className={`button_ justify-content-between min-w mr-1 ${userVote_ === 'for' && 'selected'} ${inList && 'small'}`}
                        >
                            <span className="mr-1" onClick={() => handleUserVote('for')}>
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
                                            className={`vote-avatar for ml-n2 d-none d-md-block ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${forRepresentatives[0].representativeAvatar}) no-repeat`,
                                                backgroundSize: 'cover'
                                            }}
                                        ></Link>
                                        <Link
                                            to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupChannel}/timeline/representingYou`}
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
                                    to={`/profile/${v?.handle}`}
                                    className={`vote-avatar for ml-n2 d-none d-md-block ${inList && 'tiny'}`}
                                    style={{
                                        background: `url(${v?.avatar}) no-repeat`,
                                        backgroundSize: 'cover'
                                    }}
                                ></Link>
                            ))}

                            <Link
                                to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupChannel}/timeline/direct/for`}
                                className={`vote-avatar text-decoration-none count for ml-n2 ${inList && 'tiny'}`}
                            >
                                {numeral(stats_.forCount).format('0a[.]0')}
                            </Link>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="d-flex ml-2">
                            {
                                (
                                    !!editVote_data ?
                                        editVote_data?.editVote?.QuestionStats?.againstMostRepresentingVoters :
                                        stats?.againstMostRepresentingVoters
                                )?.slice(0, 2).map((v: any) => (
                                    <Link
                                        to={`/profile/${v?.handle}`}
                                        className={`vote-avatar against ml-n2 d-none d-md-block ${inList && 'tiny'}`}
                                        style={{
                                            background: `url(${v?.avatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                ))}

                            <Link
                                to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupChannel}/timeline/direct/against`}
                                className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}>
                                {numeral(stats_.againstCount).format('0a[.]0')}
                            </Link>
                        </div>
                        <div
                            className={`button_ min-w justify-content-between text-right ml-1 ${userVote_ === 'against' && 'selected'} ${inList && 'small'}`}
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
                                            className={`vote-avatar against ml-n2 d-none d-md-block ${inList && 'tiny'}`}
                                            style={{
                                                background: `url(${againstRepresentatives[0].representativeAvatar}) no-repeat`,
                                                backgroundSize: 'cover'
                                            }}
                                        ></Link>
                                        <Link
                                            to={`/${choiceText ? 'multipoll' : 'poll'}/${voteName}/${groupChannel}/timeline/representingYou`}
                                            className={`vote-avatar text-decoration-none count against ml-n2 ${inList && 'tiny'}`}
                                        >{againstRepresentatives.length}</Link>
                                    </div>
                                )
                            }
                            <span></span>
                            <span onClick={() => handleUserVote('against')}>
                                Against
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

