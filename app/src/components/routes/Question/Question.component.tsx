import React, { FunctionComponent, useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { DiscussionEmbed } from 'disqus-react';
import numeral from 'numeral';
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";

import VoteGraph1 from "@shared/VoteGraph1";
import Chart from "@shared/VoteGraph1/chart.svg";
import Header from "@shared/Header";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import XSVG from "@shared/Icons/X.svg";
import {
    defaults,
    byGroups,
    votesBy,
    onSubTopics
} from "@state/Mock/Votes";
import SubVote from '@shared/SubVote';
import GroupSmallSvg from "@shared/Icons/Group-small.svg";
import { people } from "@state/Mock/People";
import PersonInList from '@shared/PersonInList';
import { VoteTimeline } from "@state/Mock/Notifications";
import Notification from '@shared/Notification';
import { QUESTION } from '@state/Question/typeDefs';
import { voteStatsMap } from '@state/Question/map';
import { EDIT_VOTE } from '@state/Vote/typeDefs';
import useSearchParams from "@state/Global/useSearchParams.effect";
import QuestionVotes from "./QuestionVotes";
import DropAnimation from "@components/shared/DropAnimation";
import { timeAgo } from '@state/TimeAgo';
import Choice from '@shared/Choice';

export default function Question() {

    let { voteName, groupChannel, section } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const groupChannel_ = (([g, c]) => ({
        group: g,
        channel: c
    }))(groupChannel.split("-"))

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: voteName,
            group: groupChannel_.group,
            channel: groupChannel_.channel
        }
    });

    const [editVote, {
        loading: editVote_loading,
        error: editVote_error,
        data: editVote_data,
    }] = useMutation(EDIT_VOTE);

    const userVote = editVote_data?.editVote?.position || question_data?.Question?.userVote?.position || null;

    const handleUserVote = (vote: string) => {
        editVote({
            variables: {
                questionText: question_data?.Question?.questionText,
                // choiceText
                group: question_data?.Question?.groupChannel.group,
                channel: question_data?.Question?.groupChannel.channel,
                Vote: {
                    position: (vote === userVote) ? null : vote
                },
            }
        });
    }

    console.log({
        question_loading,
        question_error,
        question_data
    });

    const stats = voteStatsMap({
        forCount: question_data?.Question?.stats?.forCount,
        againstCount: question_data?.Question?.stats?.againstCount,
        forDirectCount: question_data?.Question?.stats?.forDirectCount,
        againstDirectCount: question_data?.Question?.stats?.againstDirectCount,
        ...(!!editVote_data?.editVote?.QuestionStats) && {
            forCount: editVote_data?.editVote?.QuestionStats.forCount,
            againstCount: editVote_data?.editVote?.QuestionStats.againstCount,
            forDirectCount: editVote_data?.editVote?.QuestionStats.forDirectCount,
            againstDirectCount: editVote_data?.editVote?.QuestionStats.againstDirectCount,
        }
    });

    const forRepresentatives = question_data?.Question?.userVote?.representatives.filter((r: any) => r.position === 'for');
    const againstRepresentatives = question_data?.Question?.userVote?.representatives.filter((r: any) => r.position === 'against');

    return question_loading ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : (question_error) ? (<>Error</>) : (
        <>
            <ReactTooltip place="bottom" type="dark" effect="solid" />

            <Header title="Opinion Poll" />

            {question_data?.Question?.questionType === 'single' ? (
                <h2 className="mb-0 mt-4">Do you approve</h2>
            ) : (
                <div className="mt-4"></div>
            )}
            <h2 className="mb-2 white"><b>{voteName}</b>?</h2>

            <div>

                {/* <pre>{JSON.stringify(question_data?.Question, null, 2)}</pre> */}

                {
                    question_data?.Question?.questionType === 'multi' ?
                        question_data?.Question?.choices?.map(c => (
                            <div className="my-3">
                                <Choice
                                    choiceText={c.text}
                                    voteName={voteName}
                                    groupChannel={groupChannel}
                                    stats={c.stats}
                                    userVote={c.userVote}
                                />
                            </div>
                        )) :
                        <Choice
                            choiceText={question_data?.Question?.text}
                            voteName={voteName}
                            groupChannel={groupChannel}
                            stats={question_data?.Question?.stats}
                            userVote={question_data?.Question?.userVote}
                            showPercentages={true}
                        />
                }

                <>

                    <div className="mt-4 d-flex align-items-start flex-nowrap justify-content-between">
                        <div className="d-flex flex-nowrap">
                            <div data-tip="Selected groups"><GroupSmallSvg /></div>
                            <div className="d-flex flex-wrap justify-content-start">
                                <Link
                                    to={`/group/${question_data?.Question?.groupChannel.group}`}
                                    className="badge ml-1 mb-1 mt-1"
                                >
                                    {question_data?.Question?.groupChannel.group}
                                </Link>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            {question_data?.Question?.thisUserIsAdmin && (
                                <>
                                    <div
                                        onClick={() => alert('soon')}
                                        className={`button_ small mx-1`}
                                    >Edit</div>
                                </>
                            )}
                            <div
                                className={`button_ small mx-1`}
                            >Invite to Vote 🧪</div>
                        </div>
                        <small data-tip="Created on">
                            {/* <small className="time-ago" data-tip="Last vote was"> */}
                            {timeAgo.format(new Date(Number(question_data?.Question?.createdOn)))}
                        </small>
                        {/* <div onClick={() => setIsPollingInOtherGroup(true)} className="button_ small mb-0 mw-25">
                            poll this in another group
                        </div> */}
                    </div>
                </>

                <br />

                <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                    <li className="nav-item">
                        <Link className={`nav-link ${(!section || section === 'timeline') && 'active'}`} to={`/poll/${voteName}/${groupChannel}/timeline`}>
                            Timeline
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${section === 'votesby' && 'active'}`} to={`/poll/${voteName}/${groupChannel}/votesby`}>
                            Votes by 🧪
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${section === 'conversation' && 'active'}`} to={`/poll/${voteName}/${groupChannel}/conversation`}>
                            Conversation 🧪
                        </Link>
                    </li>
                </ul>

                <br />
                <br />

                {(section === 'votesby') && (
                    <div>
                        <h5 onClick={() => openStats("Sub Groups")}>Sub Groups</h5>
                        <div className="bar-container">
                            {byGroups.yourGroup.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="SubGroups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Your Representatives")}>Your Representatives</h4>
                        <div className="bar-container">
                            {byGroups.yourRepresentatives.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="YourRepresentatives" />
                                </div>
                            ))}
                        </div>

                        {/* <br />
                        <h4 onClick={() => openStats("People you Follow")}>People you Follow</h4>
                        <div className="bar-container">
                            {byGroups.yourRepresentatives.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="YourFollowees" />
                                </div>
                            ))}
                        </div> */}

                        {/* <br />
                        <h4 onClick={() => openStats("Location")}>Locations</h4>
                        <div className="bar-container">
                            {byGroups.location.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="Location" />
                                </div>
                            ))}
                        </div> */}

                        <br />
                        <h4 onClick={() => openStats("Age Groups")}>Age Groups</h4>
                        <div className="bar-container">
                            {byGroups.age.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="Age Groups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Location")}>Occupations</h4>
                        <div className="bar-container">
                            {byGroups.occupation.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} />
                                </div>
                            ))}
                        </div>


                        <br />
                        <h4 onClick={() => openStats("Approval on other topics")}>
                            Correlations with other Votes 🧪
                        </h4>
                        <div className="bar-container">
                            {byGroups.approvalOnOtherTopics.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`b-${i}`} {...l} />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Votes By")}>Voters</h4>
                        <div className="bar-container">
                            {votesBy.map((l, i) => (
                                <div className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`c-${i}`} {...l} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!section || section === 'timeline') && (
                    <QuestionVotes />
                )}

                {/* // VoteTimeline.map((l, i) => (
                //     <Notification v={{ ...l, poll: null }} showChart={false} />
                // ))} */}


                {(section === 'conversation') && (
                    <DiscussionEmbed
                        shortname='enronavoider'
                        config={
                            {
                                url: `http://localhost:8080/`,
                                identifier: `http://localhost:8080/`,
                                title: 'test',
                            }
                        }
                    ></DiscussionEmbed>
                )}

            </div>

        </>
    );
}
