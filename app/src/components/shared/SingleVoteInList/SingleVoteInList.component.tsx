import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import Modal from 'react-modal';
import { useQuery, useMutation } from "@apollo/client";

// import VoteGraph1 from "@shared/VoteGraph1";
import Chart from "@shared/VoteGraph1/chart.svg";
import XSVG from "@shared/Icons/X.svg";
import ProfilePlus from "@shared/Icons/Profile+-small.svg";
import { people } from "@state/Mock/People";
import PersonInList from '@shared/PersonInList';
import { EDIT_VOTE } from '@state/Vote/typeDefs';
import { voteStatsMap } from '@state/Question/map';
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const SingleVoteInList: FunctionComponent<{
    l: any,
    introMessage?: string,
    showIntroMessage?: boolean,
    showColorLegend?: boolean,
    showGroup?: boolean,
    hideTitle?: boolean
}> = ({
    l,
    introMessage,
    showIntroMessage,
    showColorLegend,
    showGroup,
    hideTitle
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        console.log({ l });

        const [editVote, {
            loading: editVote_loading,
            error: editVote_error,
            data: editVote_data,
        }] = useMutation(EDIT_VOTE);

        const userVote = editVote_data?.editVote?.position || l?.userVote?.position || null;

        const handleUserVote = (vote: string) => {
            editVote({
                variables: {
                    questionText: l.questionText,
                    // choiceText
                    group: l.groupChannel?.group,
                    channel: l.groupChannel?.channel,
                    Vote: {
                        position: (vote === userVote) ? null : vote
                    },
                }
            })
        }

        const [isShowingVotersModal, setIsShowingVotersModal] = useState(false);
        const [usersShowing, setUsersShowing] = useState('');

        const stats = voteStatsMap({
            forCount: l.stats?.forCount || 0,
            againstCount: l.stats?.againstCount || 0,
            forDirectCount: l.stats?.forDirectCount || 0,
            againstDirectCount: l.stats?.againstDirectCount || 0,
            ...(!!editVote_data?.editVote?.QuestionStats) && {
                forCount: editVote_data?.editVote?.QuestionStats.forCount,
                againstCount: editVote_data?.editVote?.QuestionStats.againstCount,
                forDirectCount: editVote_data?.editVote?.QuestionStats.forDirectCount,
                againstDirectCount: editVote_data?.editVote?.QuestionStats.againstDirectCount,
            }
        });

        const forRepresentatives = l?.userVote?.representatives.filter((r: any) => r.position === 'for');
        const againstRepresentatives = l?.userVote?.representatives.filter((r: any) => r.position === 'against');

        return (
            <div className="position-relative">
                {(l.questionText && !hideTitle) && (
                    <small className="time-ago" data-tip="Last vote was">
                        {l?.stats?.lastVoteOn || '3s ago 🧪'}
                    </small>
                )}
                <div>
                    {(showIntroMessage && !hideTitle) && (
                        <small className="do-you d-flex mb-n1">{introMessage || 'Do you approve'}</small>
                    )}
                    <div className="bar-wrapper">
                        {(!!l.questionText && !hideTitle) && (
                            <div className="mb-1 d-flex align-items-center">
                                <a
                                    className="white mb-0"
                                    href={`/poll/${l.questionText}/${l.groupChannel?.group}-${l.groupChannel?.channel}`}
                                >
                                    <div className="text-truncate" title={l.questionText}>
                                        {l.questionText}
                                        {showIntroMessage && '?'}
                                    </div>
                                </a>
                                {!!showGroup && (
                                    <div className="badge m-0 ml-2">
                                        {l.groupChannel?.group}:
                                        {l.groupChannel?.channel}
                                    </div>
                                )}
                            </div>
                        )}

                        <Chart
                            name={l.questionText}
                            forDirectCount={stats.forDirectCount}
                            forCount={stats.forCount}
                            againstDirectCount={stats.againstDirectCount}
                            againstCount={stats.againstCount}
                            userVote={null}
                            userDelegatedVotes={null}
                        />

                        {/* <pre>
                            {JSON.stringify(stats, null, 4)}
                        </pre> */}
                    </div>

                    {showColorLegend && (
                        <div className="d-flex color-legend mt-0 mb-4">
                            <div>
                                <small className="px-1">Direct For</small><div className="color forDirect count">{stats.forDirectPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Delegated For</small><div className="color for count">{stats.forDelegatedPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Direct Against</small><div className="color againstDirect count">{stats.againstDirectPercentage.toFixed(0)}%</div>
                            </div>
                            <div>
                                <small className="px-1">Delegated Against</small><div className="color against count">{stats.againstDelegatedPercentage.toFixed(0)}%</div>
                            </div>
                        </div>

                    )}

                    <div className="d-flex d-flex justify-content-between mt-1">
                        <div className="d-flex align-items-center small-for-against-buttons-container">
                            <div
                                className={`button_ small ${userVote === 'for' && 'selected'}`}
                            >
                                <span onClick={() => handleUserVote('for')}>
                                    For
                                </span>
                                {
                                    (
                                        !!forRepresentatives?.length &&
                                        l?.userVote?.position === 'delegated' &&
                                        (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                    ) && (
                                        <div className="d-flex ml-3 my-n2 mr-n1">
                                            {forRepresentatives?.slice(0, 1).map((v: any) => (
                                                <Link
                                                    key={`${v?.representativeHandle}`}
                                                    to={`/profile/${v?.representativeHandle}`}
                                                    className="vote-avatar tiny for ml-n2 d-none d-md-block"
                                                    style={{
                                                        background: `url(${v?.representativeAvatar}) no-repeat`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                ></Link>
                                            ))}
                                            <div
                                                onClick={(e) => {
                                                    updateParams({
                                                        paramsToAdd: {
                                                            modal: "ListVoters",
                                                            modalData: JSON.stringify({
                                                                votersSection: 'forRepresentatives',
                                                                questionText: l?.questionText,
                                                                groupChannel: l?.groupChannel
                                                            })
                                                        }
                                                    })
                                                }}
                                                className="vote-avatar tiny count for ml-n2"
                                            >{forRepresentatives.length}</div>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="d-flex ml-2">

                                {(
                                    editVote_data?.editVote?.QuestionStats?.forMostRepresentingVoters ||
                                    l?.stats?.forMostRepresentingVoters
                                )?.slice(0, 2).map((v: any) => (
                                    <Link
                                        key={`${v?.handle}`}
                                        to={`/profile/${v?.handle}`}
                                        className="vote-avatar tiny for ml-n1 d-none d-md-block"
                                        style={{
                                            background: `url(${v?.avatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                ))}

                                <div
                                    onClick={(e) => {
                                        updateParams({
                                            paramsToAdd: {
                                                modal: "ListVoters",
                                                modalData: JSON.stringify({
                                                    votersSection: 'forRepresentatives',
                                                    questionText: l?.questionText,
                                                    groupChannel: l?.questionText
                                                })
                                            }
                                        })
                                    }}
                                    className="vote-avatar tiny count for ml-n1"
                                >{numeral(stats.forCount).format('0a[.]0')}</div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="d-flex mr-1">
                                {(
                                    editVote_data?.editVote?.QuestionStats?.againstMostRepresentingVoters ||
                                    l?.stats?.againstMostRepresentingVoters
                                )?.slice(0, 2).map((v: any) => (
                                    <Link
                                        key={`${v?.handle}`}
                                        to={`/profile/${v?.handle}`}
                                        className="vote-avatar tiny against ml-n1 d-none d-md-block"
                                        style={{
                                            background: `url(${v?.avatar}) no-repeat`,
                                            backgroundSize: 'cover'
                                        }}
                                    ></Link>
                                ))}
                                <div onClick={() => {
                                    setIsShowingVotersModal(true);
                                    setUsersShowing(`People Voting Against on ${l.questionText}`);
                                }} className="vote-avatar tiny count against ml-n1">{numeral(stats.againstCount).format('0a[.]0')}</div>
                            </div>
                            <div
                                className={`button_ small ${userVote === 'against' && 'selected'}`}
                            >
                                <span onClick={() => handleUserVote('against')}>
                                    Against
                                </span>
                                {
                                    (
                                        !!againstRepresentatives?.length &&
                                        l?.userVote?.position === 'delegated' &&
                                        (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                    ) && (
                                        <div className="d-flex ml-3 my-n2 mr-n1">
                                            {againstRepresentatives?.slice(0, 1).map((v: any) => (
                                                <Link
                                                    key={`${v?.representativeHandle}`}
                                                    to={`/profile/${v?.representativeHandle}`}
                                                    className="vote-avatar tiny against ml-n2 d-none d-md-block"
                                                    style={{
                                                        background: `url(${v?.representativeAvatar}) no-repeat`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                ></Link>
                                            ))}
                                            <div
                                                onClick={(e) => {
                                                    updateParams({
                                                        paramsToAdd: {
                                                            modal: "ListVoters",
                                                            modalData: JSON.stringify({
                                                                votersSection: 'againstRepresentatives',
                                                                questionText: l?.questionText,
                                                                groupChannel: l?.groupChannel
                                                            })
                                                        }
                                                    })
                                                }}
                                                className="vote-avatar tiny count against ml-n2"
                                            >{againstRepresentatives.length}</div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-center">
                    {/* {l.thisUserIsAdmin && (
                        <>
                            <div
                                onClick={() => alert('soon')}
                                className={`button_ small mx-1`}
                            >Edit</div>
                        </>
                    )} */}
                    <div
                        title="Invite to vote"
                        className={`pointer mx-1`}
                        onClick={() => alert('Invite to vote - soon')}
                    ><ProfilePlus /> 🧪</div>
                </div>
            </div>
        );
    }

