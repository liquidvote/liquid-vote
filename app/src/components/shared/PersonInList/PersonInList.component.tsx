import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import Avatar from '@components/shared/Avatar';
import GroupInProfileListVotes from "@shared/GroupInProfileListVotes";
import Popper from "@shared/Popper";
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import useAuthUser from '@state/AuthUser/authUser.effect';
import useUser from '@state/User/user.effect';
import { USER, EDIT_USER_FOLLOWING_RELATION } from "@state/User/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const PersonInList: FunctionComponent<{
    person: any,
    groupHandle?: string,
    groupName?: string,
    isShowingRepresentativeRelation?: boolean,
    includeVotes?: boolean
}> = ({
    person,
    groupHandle,
    groupName,
    isShowingRepresentativeRelation,
    includeVotes
}) => {

        const { user, user_refetch } = useUser({ userHandle: person.handle, groupHandle });

        const { liquidUser } = useAuthUser();

        const [showVotes, setShowVotes] = useState(false);

        const { updateParams } = useSearchParams();

        const [editUserFollowingRelation, {
            loading: editUserFollowingRelation_loading,
            error: editUserFollowingRelation_error,
            data: editUserFollowingRelation_data,
        }] = useMutation(EDIT_USER_FOLLOWING_RELATION);

        return (
            <div className="d-flex relative border-bottom py-2 pb-3 mb-2">
                <Link to={`/profile/${person.handle}`}>
                    <Avatar person={person} type="small" groupHandle={groupHandle} />
                </Link>
                <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <Link to={`/profile/${person.handle}`} className="d-flex flex-column mb-1">
                            <div className='d-flex align-items-center'>
                                <b className="white">{person.name}</b>
                                {user?.isFollowingYou ? (
                                    <small
                                        className={`badge ml-2 mt-n1`}
                                    >follows you</small>
                                ) : null}
                            </div>
                            <small className="mt-n1">@{person.handle}</small>
                        </Link>
                        <div className="d-flex mb-1 ml-n1">
                            <div className="d-flex ml-n1 justify-content-center">
                                <div
                                    // onClick={() => setIsRepresenting(!isRepresenting)}
                                    onClick={() => !!liquidUser ? editUserFollowingRelation({
                                        variables: {
                                            FollowedHandle: user?.handle,
                                            FollowingHandle: liquidUser?.handle,
                                            IsFollowing: !user?.isYouFollowing
                                        }
                                    })
                                        .then((r) => {
                                            user_refetch();
                                        }) : (
                                        updateParams({
                                            paramsToAdd: {
                                                modal: "RegisterBefore",
                                                modalData: JSON.stringify({
                                                    toWhat: 'followUser',
                                                    userName: user?.name
                                                })
                                            }
                                        })
                                    )}
                                    className={`button_ small mr-2 ${user?.isYouFollowing ? "selected" : ""}`}
                                >
                                    {
                                        user?.isYouFollowing ?
                                            "Following" :
                                            "Follow"
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <small className="d-flex mb-0">
                        {person.bio}
                    </small>

                    {includeVotes ? (
                        <>
                            {!isShowingRepresentativeRelation ? (
                                <div className="d-flex mt-1">
                                    <small className="d-flex mb-0">
                                        <b className='white mr-1'>{' '}{user?.groupStats?.stats?.directVotesMade || 0}</b> votes
                                        {groupName ? ` on ${groupName}` : ''}
                                    </small>
                                </div>
                            ) : null}

                            {!!user?.groupStats?.stats?.directVotesMade && (
                                <small className='d-flex white'>
                                    <a className='link white pointer' onClick={() => setShowVotes(!showVotes)}>{showVotes ? 'hide' : 'show'} votes</a>
                                </small>
                            )}
                        </>
                    ) : null}


                    {showVotes && (
                        <div style={{ marginLeft: '-60px' }}>
                            <GroupInProfileListVotes
                                userHandle={person.handle}
                                groupHandle={groupHandle}
                            />
                        </div>
                    )}

                    {(isShowingRepresentativeRelation && !!person.representationGroups) ? (
                        <div
                            className="d-flex flex-wrap justify-content-start"
                        >
                            <div>
                                on:{' '}
                            </div>
                            {person.representationGroups?.map((el: any, i: any) => (
                                <Link
                                    to={`/group/${el.handle}`}
                                    key={'s-' + el.name}
                                    className={`badge inverted ml-1 mb-1 mt-1`}
                                >{el.name}</Link>
                            ))}
                        </div>

                    ) : null}
                </div>
            </div >
        );
    }

