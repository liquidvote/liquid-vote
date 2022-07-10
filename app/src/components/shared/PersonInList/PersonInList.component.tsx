import React, { FunctionComponent, useState } from 'react';
import { Link } from "react-router-dom";

import Avatar from '@components/shared/Avatar';
import GroupInProfileListVotes from "@shared/GroupInProfileListVotes";
import Popper from "@shared/Popper";
import ThreeDotsSmallSVG from '@shared/Icons/ThreeDots-small-horizontal.svg';
import useAuthUser from '@state/AuthUser/authUser.effect';
import useUser from '@state/User/user.effect';

import './style.sass';

export const PersonInList: FunctionComponent<{
    person: any,
    groupHandle?: string,
    isShowingRepresentativeRelation?: boolean
    includeVotes?: boolean
}> = ({
    person,
    groupHandle,
    isShowingRepresentativeRelation,
    includeVotes
}) => {

        const { user } = useUser({ userHandle: person.handle, groupHandle });

        const { liquidUser } = useAuthUser();

        const [showVotes, setShowVotes] = useState(false);

        return (
            <div className="d-flex relative border-bottom py-2 mb-2">
                <Link to={`/profile/${person.handle}`}>
                    <Avatar person={person} type="small" groupHandle={groupHandle} />
                </Link>
                <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <Link to={`/profile/${person.handle}`} className="d-flex flex-column mb-1">
                            <b className="white">{person.name}</b>
                            <small className="mt-n1">@{person.handle}</small>
                        </Link>
                        <div className="d-flex mb-1 ml-n1">



                            <div className="d-flex ml-n1 justify-content-center">

                                <button
                                    // onClick={() => !!liquidUser ? editGroupMemberChannelRelation({
                                    //     variables: {
                                    //         UserHandle: liquidUser?.handle,
                                    //         GroupHandle: group.handle,
                                    //         IsMember: !group?.yourMemberRelation?.isMember
                                    //     }
                                    // }) : updateParams({
                                    //     paramsToAdd: {
                                    //         modal: "RegisterBefore",
                                    //         modalData: JSON.stringify({
                                    //             toWhat: 'joinGroup',
                                    //             groupHandle: group.handle,
                                    //             groupName: group.name
                                    //         })
                                    //     }
                                    // })}
                                    // className={`button_ small ml-1 mb-0 ${isMember ? "selected" : ""}`}
                                    className={`button_ small ml-1 mb-0`}
                                // disabled={group.thisUserIsAdmin}
                                >
                                    {/* {editGroupMemberChannelRelation_loading && (
                                        <img
                                            className="vote-avatar mr-1 my-n2"
                                            src={'http://images.liquid-vote.com/system/loadingroup.gif'}
                                        />
                                    )} */}
                                    {/* {isMember ? "Joined" : "Join"} */}
                                    Follow
                                </button>
                            </div>

                            {/* <div
                            // onClick={() => setIsRepresenting(!isRepresenting)}
                            className={`button_ small mb-0`}
                        >
                            Invite to Group 🧪
                        </div>
                        <div
                            onClick={() => setIsRepresenting(!isRepresenting)}
                            className={`button_ small mb-0 ml-1 ${isRepresenting ? "selected" : ""}`}
                        >
                            {isRepresenting ? "Represents You" : "Delegate Votes To"} (TODO)
                        </div> */}

                        </div>
                    </div>
                    <small className="d-flex mb-0">
                        {person.bio}
                    </small>

                    {includeVotes ? (
                        <>
                            {!isShowingRepresentativeRelation ? (
                                <div className="d-flex mb-n1">
                                    <small className="d-flex mb-0">
                                        <b className='white mr-1'>{' '}{person?.stats?.directVotesMade || 0}</b> votes
                                    </small>
                                </div>
                            ) : null}

                            {!!person?.stats?.directVotesMade && (
                                <small className='white'>
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
                            // subsection={null}
                            // subsubsection={null}
                            />
                        </div>
                    )}

                    {/* <pre>{JSON.stringify(person, null, 2)}</pre> */}
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
                    {/*
                <small>
                    Voted the same as you in
                    {' '}<b className="white forDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}polls and different in
                    {' '}<b className="white againstDirect px-1 rounded">{useMemo(() => Math.floor(Math.random() * 100), [])}</b>
                    {' '}🧪
                </small> */}
                    {/* <pre>{JSON.stringify({
                    yourStats: person.yourStats,
                    'stats.directVotesMade': person.stats?.directVotesMade,
                }, null, 2)}</pre> */}

                </div>
            </div >
        );
    }

