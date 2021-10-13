import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from "@apollo/client";

import { timeAgo } from '@state/TimeAgo';
import GroupSvg from "@shared/Icons/Group.svg";
import LikeSVG from '@components/shared/Icons/Like.svg';
import LikedSVG from '@components/shared/Icons/Liked.svg';
import { EDIT_ARGUMENT_UP_VOTE } from "@state/ArgumentUpVotes/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const ArgumentInList: FunctionComponent<{ a: any }> = ({ a }) => {

    const { liquidUser } = useAuthUser();
    const { allSearchParams, updateParams } = useSearchParams();

    const [editArgumentUpVote, {
        loading: editArgumentUpVote_loading,
        error: editArgumentUpVote_error,
        data: editArgumentUpVote_data,
    }] = useMutation(EDIT_ARGUMENT_UP_VOTE);

    const voted = !!editArgumentUpVote_data ? editArgumentUpVote_data?.editArgumentUpVote?.voted : a?.yourUpVote;
    const count = !!editArgumentUpVote_data ? editArgumentUpVote_data?.editArgumentUpVote?.argument?.stats?.votes : a?.stats?.votes;

    return (
        <>
            <div className="d-flex">
                <Link to={`/profile/${a.user?.handle}`}>
                    <div
                        className={`small-avatar bg`}
                        style={{
                            background: a.user?.avatar && `url(${a.user?.avatar}) 50% 50% / cover no-repeat`
                        }}
                    ></div>
                </Link>
                <div className="flex-fill">
                    <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                        <div className="w-75">
                            <Link to={`/profile/${a.user?.handle}`} className="d-block mb-n1">
                                <b className="mr-1">{a.user?.name}</b>
                            </Link>
                        </div>
                        <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                            <small className="text-right" data-tip="Voted on">
                                {timeAgo.format(new Date(Number(a?.lastEditOn)))}
                            </small>
                            {/* <div className="d-flex flex-wrap justify-content-end">
                                <div className="tiny-svg-wrapper"><GroupSvg /></div>
                                <Link
                                    to={`/group/${a.group?.handle}`}
                                    className="badge ml-1 mb-1 mt-1"
                                >
                                    {a.group?.name}
                                </Link>
                            </div> */}
                        </div>
                    </div>
                    <p className="mt-1 mb-0 white pre-wrap">
                        {a.argumentText}
                    </p>
                    {/* <pre>{JSON.stringify(a, null, 2)}</pre> */}
                    <div className="mt-1 d-flex align-items-center">
                        <div className="pointer mr-1" onClick={() => !!liquidUser ? editArgumentUpVote({
                            variables: {
                                questionText: a.question.questionText,
                                groupHandle: a.group.handle,
                                userHandle: liquidUser?.handle,
                                voted: !voted
                            }
                        }) : updateParams({
                            paramsToAdd: {
                                modal: "RegisterBefore",
                                modalData: JSON.stringify({
                                    toWhat: 'upVoteArgument'
                                })
                            }
                        })}>{!!voted ? <LikedSVG /> : <LikeSVG />}</div>
                        <div>{count > 0 ? count : ''}</div>
                        {editArgumentUpVote_loading && (
                            <img
                                className="vote-avatar ml-1"
                                src={'http://images.liquid-vote.com/system/loading.gif'}
                                alt={'loading'}
                            />
                        )}
                    </div>
                </div>
            </div>
            <hr />
        </>
    );
}

