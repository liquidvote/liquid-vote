import React, { useEffect } from 'react';
import { DiscussionEmbed } from 'disqus-react';
import { Link, useParams } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import { useQuery } from "@apollo/client";
import Linkify from 'linkify-react';

import DropAnimation from "@components/shared/DropAnimation";
import Choice from '@shared/Choice';
import Header from "@shared/Header";
import GroupSmallSvg from "@shared/Icons/Group-small.svg";
import VoteGraph1 from "@shared/VoteGraph1";
import useSearchParams from "@state/Global/useSearchParams.effect";
import {
    byGroups,
    votesBy
} from "@state/Mock/Votes";
import { QUESTION } from '@state/Question/typeDefs';
import { timeAgo } from '@state/TimeAgo';
// import useGroup from '@state/Group/group.effect';
import useUserRepresentedBy from "@state/User/userRepresentedBy.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useGroup from '@state/Group/group.effect';

import QuestionVotes from "./QuestionVotes";
import QuestionArguments from "./QuestionArguments";
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import Popper from "@shared/Popper";

export default function Question() {

    let { voteName, groupHandle, section } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { group, group_refetch } = useGroup({ handle: groupHandle });

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: voteName,
            group: groupHandle,
            // channel: groupChannel_.channel
        }
    });

    useEffect(() => {
        if (allSearchParams.refetch === 'question') {
            question_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    const { liquidUser } = useAuthUser();

    const { representatives } = useUserRepresentedBy({
        userHandle: liquidUser?.handle,
        groupHandle: groupHandle
    });

    const question = question_data?.Question;

    // const sortedChoices = question?.questionType === 'multi' ? [...question?.choices]?.
    //     sort((a, b) => (b?.stats?.directVotes + b?.stats?.indirectVotes) - (a?.stats?.directVotes + a?.stats?.indirectVotes)) : [];


    // const maxVoteCount = question?.questionType === 'multi' && sortedChoices?.[0]?.stats?.directVotes + sortedChoices?.[0]?.stats?.indirectVotes;

    return question_loading ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : (question_error) ? (<>Error</>) : (
        <>
            <ReactTooltip place="bottom" type="dark" effect="solid" />

            <Header title="Opinion Poll" />

            <div className="poll-cover-container on-poll">
                <div
                    className="poll-cover"
                    style={{
                        background: question?.group?.cover && `url(${question?.group?.cover}) 50% 50% / cover no-repeat`
                    }}
                />
                <div className="poll-cover-overlay">
                </div>
                <div className="poll-cover-info">
                    <Link to={`/group/${question?.group?.handle}`}>
                        <h5 className="white p-0 m-0">
                            {question?.group?.name}
                        </h5>
                    </Link>
                </div>
            </div>

            <div className={`mt-3 mb-n2 d-flex ${!!representatives?.length && 'justify-content-between'} align-items-center`}>
                <div className="d-flex">
                    <p className="mb-0">Vote or {!!representatives?.length && 'be represented by'}</p>

                    {!!representatives?.length && (
                        <div className="d-flex ml-2 pl-1 mr-1 align-items-center">
                            {representatives?.map((r: any) => (
                                <Link
                                    key={`representatives-${r.handle}`}
                                    to={`/profile/${r.handle}`}
                                    className={`vote-avatar tiny ml-n2`}
                                    style={{
                                        background: `url(${r.avatar}) 50% 50% / cover no-repeat`
                                    }}
                                    title={r.name}
                                ></Link>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    className="button_ small mb-0 ml-2"
                    onClick={() => !liquidUser ? updateParams({
                        paramsToAdd: {
                            modal: "RegisterBefore",
                            modalData: JSON.stringify({
                                toWhat: 'chooseRepresentatives',
                                groupHandle: group.handle,
                                groupName: group.name
                            })
                        }
                    }) : updateParams({
                        paramsToAdd: {
                            modal: "ChooseRepresentatives",
                            modalData: JSON.stringify({
                                groupHandle: question?.groupChannel.group
                            })
                        }
                    })}
                >
                    Choose Representatives
                </div>

            </div>

            <div className="position-relative">
                {question?.questionType === 'single' ? (
                    <h2 className="mb-0 mt-4">Do you {question?.startText || 'approve'}</h2>
                ) : (
                    <div className="mt-4"></div>
                )}
                <h2 className="mb-2 white pre-wrap"><b>{voteName}</b>?</h2>

                {question.thisUserIsAdmin && (
                    <div className="time-ago d-flex flex-column justify-content-end pointer">
                        <Popper
                            rightOnSmall={true}
                            button={<div>
                                <ThreeDotsSmallSVG />
                            </div>}
                            popperContent={
                                <ul className="p-0 m-0 mx-2">
                                    <li
                                        className="pointer my-2 text-danger"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "DeletePoll",
                                                modalData: JSON.stringify({
                                                    questionText: question?.questionText,
                                                    group: question?.groupChannel?.group,
                                                    navToGroup: true
                                                })
                                            }
                                        })}
                                    >
                                        Delete
                                    </li>
                                    <li
                                        className="pointer my-2"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "EditQuestion",
                                                modalData: JSON.stringify({
                                                    questionText: question?.questionText,
                                                    groupHandle: question?.groupChannel?.group,
                                                })
                                            }
                                        })}
                                    >
                                        Edit
                                    </li>
                                </ul>
                            }
                        />
                    </div>
                )}
            </div>

            {!!question?.description && (
                <p className="pre-wrap white-links">
                    {/* {question?.description} */}
                    <Linkify tagName="span">
                        {question?.description}
                    </Linkify>
                </p>
            )}

            <div>

                {/* <pre>{JSON.stringify(question, null, 2)}</pre> */}

                {
                    question?.questionType === 'multi' ?
                        [...question?.choices]?.map(c => (
                            <div key={c.text} className="my-3">
                                <Choice
                                    choiceText={c.text}
                                    voteName={voteName}
                                    groupHandle={groupHandle}
                                    stats={c.stats}
                                    yourVote={c.yourVote}
                                // maxVoteCount={maxVoteCount}
                                />
                            </div>
                        )) :
                        <Choice
                            choiceText={question?.text}
                            voteName={voteName}
                            groupHandle={groupHandle}
                            stats={question?.stats}
                            yourVote={question?.yourVote}
                            showPercentages={true}
                        />
                }

                <>

                    <div className="mt-4 d-flex align-items-center flex-nowrap justify-content-between">
                        <div className="d-flex flex-nowrap">
                            <div data-tip="Selected groups"><GroupSmallSvg /></div>
                            <div className="d-flex flex-wrap justify-content-start">
                                <Link
                                    to={`/group/${groupHandle}`}
                                    className="badge ml-1 mb-1 mt-1"
                                >
                                    {question?.groupChannel?.group}
                                </Link>
                            </div>
                        </div>
                        {/* <div className="d-flex justify-content-center">
                            {
                                (
                                    question?.thisUserIsAdmin ||
                                    group?.thisUserIsAdmin
                                ) && (
                                    <>
                                        <div
                                            onClick={() => updateParams({
                                                paramsToAdd: {
                                                    modal: "EditQuestion",
                                                    modalData: JSON.stringify({
                                                        questionText: voteName,
                                                        groupHandle: group.handle,
                                                    })
                                                }
                                            })}
                                            className={`button_ small mx-1`}
                                        >Edit</div>
                                    </>
                                )}
                        </div> */}
                        <small
                            // data-tip={`Poll launched ${!!question?.createdBy ? `by ${question?.createdBy?.name}` : ''} on`}
                            className="d-flex justify-content-center align-items-center"
                        >
                            {/* <small className="time-ago" data-tip="Last vote was"> */}
                            {!!question?.createdBy && (
                                <Link to={`/profile/${question?.createdBy.handle}`}>
                                    <div
                                        className="vote-avatar none mr-1"
                                        style={{
                                            background: question?.createdBy.avatar && `url(${question?.createdBy.avatar}) 50% 50% / cover no-repeat`
                                        }}
                                    ></div>
                                </Link>
                            )}
                            {' '}launched{' '}
                            {timeAgo.format(new Date(Number(question?.createdOn)))}
                        </small>
                        {/* <div onClick={() => setIsPollingInOtherGroup(true)} className="button_ small mb-0 mw-25">
                            poll this in another group
                        </div> */}
                    </div>
                </>

                <br />

                <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                    <li className="nav-item">
                        <Link className={`nav-link ${(!section || section === 'arguments') && 'active'}`} to={`/poll/${voteName}/${groupHandle}/arguments`}>
                            Arguments
                        </Link>
                    </li>
                    {/* <li className="nav-item">
                        <Link className={`nav-link ${section === 'votesby' && 'active'}`} to={`/poll/${voteName}/${groupHandle}/votesby`}>
                            Votes by 🧪
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${(!section || section === 'timeline') && 'active'}`} to={`/poll/${voteName}/${groupHandle}/timeline`}>
                            Votes
                        </Link>
                    </li> */}
                </ul>

                <br />
                <br />

                {(!section || section === 'arguments') && (
                    <QuestionArguments />
                )}

                {(section === 'votesby') && (
                    <div>
                        <h5 onClick={() => openStats("Sub Groups")}>Sub Groups</h5>
                        <div className="bar-container">
                            {byGroups.yourGroup.map((l, i) => (
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="SubGroups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Your Representatives")}>Your Representatives</h4>
                        <div className="bar-container">
                            {byGroups.yourRepresentatives.map((l, i) => (
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
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
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`a-${i}`} {...l} group="Age Groups" />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Location")}>Occupations</h4>
                        <div className="bar-container">
                            {byGroups.occupation.map((l, i) => (
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
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
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`b-${i}`} {...l} />
                                </div>
                            ))}
                        </div>

                        <br />
                        <h4 onClick={() => openStats("Votes By")}>Voters</h4>
                        <div className="bar-container">
                            {votesBy.map((l, i) => (
                                <div key={i} className="bar-wrapper" style={{ flex: l.flexSize }}>
                                    <VoteGraph1 key={`c-${i}`} {...l} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(section === 'timeline') && (
                    <QuestionVotes />
                )}

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
