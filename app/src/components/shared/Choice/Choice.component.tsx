import React, { FunctionComponent, useEffect } from 'react';
import { Link } from "react-router-dom";
import numeral from 'numeral';
import { useMutation } from "@apollo/client";

import { EDIT_VOTE } from '@state/Vote/typeDefs';
import { USER } from "@state/User/typeDefs";
import Chart from "@shared/VoteGraph1/chart.svg";
import { voteStatsMap } from '@state/Question/map';
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";
import Avatar from '@components/shared/Avatar';
import useGroup from "@state/Group/group.effect";
import { EDIT_GROUP_MEMBER_CHANNEL_RELATION } from "@state/User/typeDefs";

import YayNayBubbles from './YayNayBubbles';
import './style.sass';

export const Choice: FunctionComponent<{
    choiceText?: string,
    voteName?: string, // TODO: change to `questionText`
    groupHandle?: string,
    stats: any,
    yourVote: any,
    yourStats: any,
    userVote?: any,
    inList?: boolean,
    showPercentages?: boolean,
    showChart?: boolean,
    maxVoteCount?: number,
    user?: any,
    extraRefetchQueries?: any,
    inviterHandle?: string,
    votersInCommonStats?: any
    originalQuestion?: any
}> = ({
    choiceText,
    voteName,
    groupHandle,
    stats,
    yourVote,
    yourStats,
    userVote,
    inList,
    showPercentages,
    showChart = true,
    maxVoteCount,
    user,
    extraRefetchQueries,
    inviterHandle,
    votersInCommonStats,
    originalQuestion
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        const { liquidUser } = useAuthUser();

        const { group } = useGroup({ handle: groupHandle });

        const [editVote, {
            loading: editVote_loading,
            error: editVote_error,
            data: editVote_data,
        }] = useMutation(EDIT_VOTE, {
            ...!!user && {
                refetchQueries: () => [
                    {
                        query: USER,
                        variables: {
                            handle: user.handle,
                            groupHandle
                        },
                    },
                    ...extraRefetchQueries ? extraRefetchQueries : []
                ],
            },
            ...!user && extraRefetchQueries && {
                refetchQueries: () => [
                    ...extraRefetchQueries ? extraRefetchQueries : []
                ],
            },
        });

        const yourVote_ = editVote_data ? editVote_data?.editVote : yourVote;

        const [editGroupMemberChannelRelation, {
            loading: editGroupMemberChannelRelation_loading,
            error: editGroupMemberChannelRelation_error,
            data: editGroupMemberChannelRelation_data,
        }] = useMutation(EDIT_GROUP_MEMBER_CHANNEL_RELATION, {
            update: cache => {
                cache.evict({
                    id: "ROOT_QUERY",
                    fieldName: "UserGroups"
                });
                cache.evict({
                    id: "ROOT_QUERY",
                    fieldName: "Group",
                    args: { handle: groupHandle },
                    broadcast: true,
                    // Group:{"handle":"should-it-be-legal"}
                    // fieldName: "UserGroups"
                });
                cache.gc();
            }
        });

        // console.log({
        //     yourVote,
        //     yourVote_,
        //     edited: editVote_data?.editVote
        // });

        const handleUserVote = (vote: string) => {

            if (!!liquidUser) {

                if (
                    !group?.yourMemberRelation?.isMember && !(vote === yourVote_?.position)
                ) {
                    editGroupMemberChannelRelation({
                        variables: {
                            UserHandle: liquidUser?.handle,
                            GroupHandle: groupHandle,
                            IsMember: true
                        }
                    })
                }

                editVote({
                    variables: {
                        questionText: voteName,
                        choiceText,
                        group: groupHandle,
                        Vote: {
                            position: (vote === yourVote_?.position) ? null : vote
                        },
                        inviterHandle
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

        const forRepresentatives = yourVote_?.representatives?.filter((r: any) => r.position === 'for');
        const againstRepresentatives = yourVote_?.representatives?.filter((r: any) => r.position === 'against');

        const forFollowees = yourStats?.votersYouFollow?.filter((r: any) => r?.vote?.position === 'for');
        const againstFollowees = yourStats?.votersYouFollow?.filter((r: any) => r?.vote?.position === 'against');

        const forDisplayed = [
            ...yourStats?.votersYouFollow?.filter((r: any) => r?.vote?.position === 'for') || [],
            ...(
                (!!editVote_data ? editVote_data?.editVote?.QuestionStats?.forMostRepresentingVoters : stats?.forMostRepresentingVoters) || []
            )
                ?.filter((u: any) => u?.handle !== liquidUser?.handle)
                ?.filter((u: any) => !yourStats?.votersYouFollow
                    ?.filter((r: any) => r?.vote?.position === 'for')
                    ?.find((u_: any) => u_.handle === u.handle))
                ?.map(v => ({ ...v, hideComparisson: true }))
        ];

        // console.log({
        //     votersYouFollow: yourStats?.votersYouFollow,
        //     stats,
        //     forDisplayed
        // });

        const againstDisplayed = [
            ...yourStats?.votersYouFollow?.filter((r: any) => r?.vote?.position === 'against') || [],
            ...(
                (!!editVote_data ? editVote_data?.editVote?.QuestionStats?.againstMostRepresentingVoters : stats?.againstMostRepresentingVoters) || []
            )
                ?.filter((u: any) => u?.handle !== liquidUser?.handle)
                ?.filter((u: any) => !yourStats?.votersYouFollow
                    ?.filter((r: any) => r?.vote?.position === 'against')
                    ?.find((u_: any) => u_.handle === u.handle))
                ?.map(v => ({ ...v, hideComparisson: true }))
        ];

        const representeeVotesCount = editVote_data ?
            editVote_data?.editVote?.representeeVotes?.filter(v => v.isDirect === false)?.length :
            yourStats?.usersYouAreRepresentingCount;

        // const newMaxCount =
        //     editVote_data &&
        //     maxVoteCount === (stats?.forCount + stats?.againstCount) ? 


        // console.log({
        //     yourVote,
        //     forRepresentatives,
        //     againstRepresentatives,
        //     forFollowees,
        //     againstFollowees,
        //     forMostRepresenting: stats?.forMostRepresentingVoters,
        //     againstMostRepresenting: stats?.againstMostRepresentingVoters,
        // })

        const maxVoteCount_ = maxVoteCount || (stats_?.forCount + stats_?.againstCount);

        const maxChartWidth = (
            (
                (
                    editVote_data?.editVote?.QuestionStats ? (
                        editVote_data?.editVote?.QuestionStats?.forCount +
                        editVote_data?.editVote?.QuestionStats?.againstCount
                        // + editVote_data?.editVote?.QuestionStats?.indirectVotes
                    ) : (
                        stats?.forCount
                        + stats?.againstCount
                        // + stats?.indirectVotes
                    )
                ) / maxVoteCount_
            ) || 0.2
        )
            * 100;

        // useEffect(() => {
        //     if(editVote_data && maxVoteCount === (stats?.forCount + stats?.againstCount)) {
        //         console.log("update max vote count");
        //     }
        // }, [maxVoteCount_]);

        return (
            <div className={`${!inList && 'not-in-list'}`}>
                <div
                    className="d-flex flex-column mb-1"
                >
                    {!!choiceText && (
                        <div className={`d-flex align-items-center mr-2 ${inList && 'small'}`}>
                            <b className="white">{choiceText}</b>
                            {/* {(!!user && !!userVote) && (
                                <div className="ml-2">
                                    <VotedExplanation
                                        position={userVote.position}
                                        representeeVotes={userVote.representeeVotes}
                                        representatives={userVote.representatives}
                                        user={user}
                                    />
                                </div>
                            )} */}
                        </div>
                    )}

                    {/* {showChart && (
                        <div className="d-flex flex-column justify-content-end mb-1 mt-n1">
                            <small className="tiny-text" data-tip="Last vote was">
                                {!!stats?.lastVoteOn ?
                                    'last vote ' + timeAgo.format(new Date(Number(stats?.lastVoteOn))) :
                                    'no votes yet'
                                }
                            </small>
                        </div>
                    )} */}

                    {/* <pre>{JSON.stringify(userVote, null, 2)}</pre> */}
                    {showChart && (
                        <div
                            className='d-flex justify-content-center w-100'
                        >
                            <span
                                className='w-100'
                                style={{ 'maxWidth': maxChartWidth + '%'  }}
                            >
                                <Chart
                                    name={choiceText || null}
                                    forDirectCount={stats_.forDirectCount}
                                    forCount={stats_.forCount}
                                    againstDirectCount={stats_.againstDirectCount}
                                    againstCount={stats_.againstCount}
                                    userDelegatedVotes={null}
                                    inList={inList}
                                />
                            </span>
                        </div>
                    )}
                </div>

                {showChart && (
                    <div className={`d-flex d-flex justify-content-between mt-1 ${userVote?.position === "against" && 'voted-right againstBorderColor'} ${userVote?.position === "for" && 'voted-left forBorderColor'}`}>
                        <div className="d-flex c-on-tiny flex-wrap">
                            <div
                                className={`forbtn button_ forDirectBorder justify-content-between min-w mr-1 ${yourVote_?.position === 'for' && 'forDirectBg'} ${inList && 'small'}`}
                                onClick={() => handleUserVote('for')}
                            >
                                <span className="mr-1">
                                    Yay
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
                                            >
                                                <Avatar
                                                    person={{
                                                        avatar: forRepresentatives[0].representativeAvatar,
                                                        handle: forRepresentatives[0].representativeHandle,
                                                        name: forRepresentatives[0].representativeName,
                                                        yourStats: forRepresentatives[0].yourStats,
                                                        stats: forRepresentatives[0].stats
                                                    }}
                                                    groupHandle={groupHandle}
                                                    type={inList ? 'tiny' : 'vote'}
                                                />
                                            </Link>
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
                                                className={`text-decoration-none count for ml-n2 ${inList ? 'tiny-avatar' : 'vote-avatar'}`}
                                            >{forRepresentatives.length}</div>
                                        </div>
                                    )
                                }

                                {yourVote_?.position === 'for' && (
                                    <div className={`d-flex ml-2 my-n2 ${inList ? 'mr-n1' : 'mr-n2'}`}>
                                        <Avatar
                                            person={{
                                                ...liquidUser
                                            }}
                                            groupHandle={groupHandle}
                                            type={inList ? 'tiny' : 'vote'}
                                        />
                                        {representeeVotesCount ? (
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
                                                                    subsection: 'represented',
                                                                    subsubsection: 'byyou'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                                className={`text-decoration-none count for ml-n2 ${inList ? 'tiny-avatar' : 'vote-avatar'}`}
                                            >{representeeVotesCount}</div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {inList ? (
                                <div
                                    className="d-flex ml-1 pointer"
                                    data-tip={`Voted Yay`}
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
                                                        subsubsection: 'all',
                                                        followsOnly: true
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    {(
                                        !!user ? [] : forDisplayed
                                    )?.slice(0, 3)?.map((p: any) => (
                                        <div key={`forDisplayedVoter-${voteName}-${p?.handle}`} className="ml-n1">
                                            <Avatar
                                                person={p}
                                                groupHandle={groupHandle}
                                                type={inList ? 'tiny' : 'vote'}
                                                hideComparisson={p.hideComparisson}
                                            />
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <div
                                    className="d-flex pointer flex-wrap mt-2 w-100 w-100-plus20"
                                >
                                    {(
                                        !!user ? [] : forDisplayed
                                    )?.map((p: any) => (
                                        <div key={`forDisplayedVoter-${voteName}-${p?.handle}`} className="mr-2 mb-2">
                                            <Link
                                                to={`/profile/${p.handle}`}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <Avatar
                                                    person={p}
                                                    groupHandle={groupHandle}
                                                    type={inList ? 'tiny' : 'vote'}
                                                    hideComparisson={p.hideComparisson}
                                                />
                                            </Link>
                                        </div>
                                    ))}

                                </div>
                            )}
                            <div>
                                {(
                                    user && userVote?.position === "for" && (
                                        <div className='d-flex justify-content-center align-items-center'>
                                            <Avatar
                                                person={user}
                                                groupHandle={groupHandle}
                                                type={inList ? 'tiny' : 'vote'}
                                            />

                                            <small>
                                                {/* <b className='ml-2 mr-1 forColor'>
                                                    voted
                                                </b> */}
                                                {userVote?.position === 'for' && (
                                                    <b className='white mr-1 forDirect px-1 rounded'>yay</b>
                                                )}
                                            </small>
                                        </div>
                                    )
                                )}
                            </div>

                        </div>

                        {editVote_loading ? (
                            <img
                                className={`vote-avatar ${inList && 'tiny-loader'}`}
                                src={'http://images.liquid-vote.com/system/loading.gif'}
                            />
                        ) : (
                            <>
                                <div
                                    className={`
                                        pointer text-decoration-none count for mr-n1
                                        ${inList ? 'tiny-avatar' : 'vote-avatar'}
                                        ${stats_?.forCount > stats_?.againstCount && 'z-2'}
                                    `}
                                    style={{
                                        ...(maxVoteCount_) && {
                                            'transform':
                                                `scale(${((stats_?.forCount | 0) / maxVoteCount_) * 0.8 + 0.8})`
                                        }
                                    }}
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
                                                        subsubsection: 'for',
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    {numeral(stats_.forCount).format('0a[.]0')}
                                </div>
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
                                    className={`
                                        text-decoration-none count against ml-1
                                        ${inList ? 'tiny-avatar' : 'vote-avatar'}
                                        ${stats_?.forCount < stats_?.againstCount && 'z-2'}
                                    `}
                                    style={{
                                        ...(maxVoteCount_) && {
                                            'transform':
                                                `scale(${((stats_?.againstCount | 0) / maxVoteCount_) * 0.8 + 0.8})`
                                        }
                                    }}
                                >
                                    {numeral(stats_.againstCount).format('0a[.]0')}
                                </div>
                            </>
                        )}

                        <div className="d-flex cr-on-tiny justify-content-end flex-wrap-reverse">

                            <div>
                                {(
                                    user && userVote?.position === "against" && (
                                        <div className='d-flex justify-content-center align-items-center mr-n2'>
                                            <Avatar
                                                person={user}
                                                groupHandle={groupHandle}
                                                type={inList ? 'tiny' : 'vote'}
                                            />
                                            <small>
                                                {/* <b className='ml-2 mr-1 againstColor'>
                                                    voted
                                                </b> */}
                                                <b className='white mr-1 againstDirect px-1 rounded'>nay</b>
                                            </small>
                                        </div>
                                    )
                                )}
                            </div>

                            {inList ? (
                                <div
                                    className="d-flex ml-2 pointer" data-tip={`Voted Nay`}
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
                                                        subsubsection: 'all',
                                                        followsOnly: true
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    {
                                        (
                                            !!user ? [] : againstDisplayed
                                        )?.slice(0, 3).map((p: any) => (
                                            <div key={`againstDisplayedVoter-${voteName}-${p?.handle}`} className="ml-n1">
                                                <Avatar
                                                    person={p}
                                                    groupHandle={groupHandle}
                                                    type={inList ? 'tiny' : 'vote'}
                                                    hideComparisson={p.hideComparisson}
                                                />
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : <div
                                className="d-flex mr-n2 pointer w-100 w-100-plus20 flex-wrap mt-2 justify-content-end"
                            >
                                {
                                    (
                                        !!user ? [] : againstDisplayed
                                    )?.map((p: any) => (
                                        <div key={`againstDisplayedVoter-${voteName}-${p?.handle}`} className="mr-2 mb-2">
                                            <Link
                                                to={`/profile/${p.handle}`}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <Avatar
                                                    person={p}
                                                    groupHandle={groupHandle}
                                                    type={inList ? 'tiny' : 'vote'}
                                                    hideComparisson={p.hideComparisson}
                                                />
                                            </Link>
                                        </div>
                                    ))
                                }
                            </div>}

                            <div
                                className={`againstbtn button_ againstDirectBorder min-w justify-content-between text-right ml-1 ${yourVote_?.position === 'against' && 'againstDirectBg'} ${inList && 'small'}`}
                                onClick={() => handleUserVote('against')}
                            >
                                {
                                    (
                                        !!againstRepresentatives?.length &&
                                        yourVote?.position === 'delegated' &&
                                        (!editVote_data || editVote_data?.editVote?.position === 'delegated')
                                    ) && (
                                        <div className={`d-flex mr-1 my-n2 ${inList ? 'ml-n1' : 'ml-n2'}`} data-tip={`Representing you`}>
                                            <Link
                                                to={`/profile/${againstRepresentatives[0].representativeHandle}`}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <Avatar
                                                    person={{
                                                        avatar: againstRepresentatives[0].representativeAvatar,
                                                        handle: againstRepresentatives[0].representativeHandle,
                                                        name: againstRepresentatives[0].representativeName,
                                                        yourStats: againstRepresentatives[0].yourStats,
                                                        stats: againstRepresentatives[0].stats
                                                    }}
                                                    groupHandle={groupHandle}
                                                    type={inList ? 'tiny' : 'vote'}
                                                />
                                            </Link>
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
                                                className={`text-decoration-none count against ml-n2 ${inList ? 'tiny-avatar' : 'vote-avatar'}`}
                                            >{againstRepresentatives.length}</div>
                                        </div>
                                    )
                                }

                                {yourVote_?.position === 'against' && (
                                    <div className={`d-flex mr-1 my-n2 ${inList ? 'ml-n1' : 'ml-n2'}`}>
                                        <Avatar
                                            person={{
                                                ...liquidUser
                                            }}
                                            groupHandle={groupHandle}
                                            type={inList ? 'tiny' : 'vote'}
                                        />

                                        {representeeVotesCount ? (
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
                                                                    subsection: 'represented',
                                                                    subsubsection: 'byyou'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                                className={`text-decoration-none count against ml-n2 ${inList ? 'tiny-avatar' : 'vote-avatar'}`}
                                            >{representeeVotesCount}</div>
                                        ) : null}
                                    </div>
                                )}

                                <span className='ml-auto'>
                                    Nay
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {votersInCommonStats ? (
                    <>
                        <br />
                        {votersInCommonStats?.choices?.filter(c => !choiceText || c?.choiceText === choiceText)?.map((c, i) => (
                            <div>
                                <div className='d-flex justify-content-center align-items-center'>
                                    <div className='d-flex'>
                                        <YayNayBubbles
                                            parent="yay"
                                            forCount={c?.stats?.for_for}
                                            againstCount={c?.stats?.against_for}
                                            maxVoteCount={maxVoteCount_}
                                        />
                                        <div className='p-2'></div>
                                        <YayNayBubbles
                                            parent="nay"
                                            forCount={c?.stats?.for_against}
                                            againstCount={c?.stats?.against_against}
                                            maxVoteCount={maxVoteCount_}
                                        />
                                    </div>
                                </div>
                                {
                                    c?.originalQuestionVoteChoiceText ? (
                                        <div className='faded d-flex align-items-center justify-content-center'>
                                            <small>
                                                <b>{c?.originalQuestionVoteChoiceText}</b>
                                                {/* <span>{c?.choiceText}</span> */}
                                            </small>
                                            <br />
                                        </div>
                                    ) : null
                                }
                            </div>
                        ))}

                        <div className='d-flex align-items-center justify-content-center'>
                            <br />
                            <small><b className='faded white mb-5 text-center'>{originalQuestion?.questionText}</b></small>
                        </div>
                    </>
                ) : null}
            </div >
        );
    }

