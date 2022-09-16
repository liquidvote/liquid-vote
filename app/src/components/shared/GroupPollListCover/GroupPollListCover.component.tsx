import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";

import GroupVisibilityPicker from '@components/shared/GroupVisibilityPicker';
import Avatar from '@components/shared/Avatar';
import useUser from '@state/User/user.effect';

import './style.sass';

export const GroupPollListCover: FunctionComponent<{ group: any, user?: any }> = ({ group, user }) => {

    const { user: userWithMoreData } = useUser({ userHandle: user?.handle, groupHandle: group?.handle });

    return (
        <>
            <div className="sticky-top">
                {/* <div className="poll-cover-container">
                    <div
                        className="poll-cover"
                        style={{
                            background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                        }}
                    />
                    <div className="poll-cover-overlay">
                    </div>
                    <div className="poll-cover-info">
                        <Link to={`/group/${group?.handle}`}>
                            <h5 className="white p-0 m-0">
                                {group?.name}
                            </h5>
                        </Link>
                    </div>
                </div> */}

                <div className="poll-cover-container">
                    <div
                        className="poll-cover"
                        style={{
                            background: group?.cover && `url(${group?.cover}) 50% 50% / cover no-repeat`
                        }}
                    />
                    <div className="poll-cover-overlay">
                    </div>
                    <div className="poll-cover-info">
                        <div className="flex-fill py-2">
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center pt-1">
                                        <div className="d-flex align-items-center">
                                            <Link to={`/group/${group.handle}`} className="mr-2">
                                                <h5 className="white p-0 m-0">{group.name}</h5>
                                            </Link>
                                        </div>
                                        {/* <small className="mt-n1">@DanPriceSeattle</small> */}
                                        {/* <div className="ml-2 mt-n1">
                                                {group?.privacy === "private" ? (
                                                    <LockSVG />
                                                ) : group?.privacy === "public" ? (
                                                    <WorldSVG />
                                                ) : <LinkSVG />}
                                            </div> */}
                                    </div>


                                    {user ? (
                                        <div className='d-flex align-items-stretch pb-3 mb-n3 mt-2'>
                                            <Link
                                                replace
                                                className="position-relative mt-n1"
                                                to={`/profile/${user.handle}/cause/${group.handle}`}
                                            >
                                                <Avatar
                                                    person={{
                                                        ...user,
                                                        // yourStats: userWithMoreData.yourUserStats,
                                                        // stats: userWithMoreData.userStats
                                                    }}
                                                    groupHandle={group?.handle}
                                                    type="vote"
                                                />
                                            </Link>

                                            {userWithMoreData ? (
                                                <div className='d-flex align-items-center ml-2 mt-n1'>
                                                    <div className='d-flex flex-column'>
                                                        <Link
                                                            replace
                                                            className="d-flex flex-column text-decoration-none"
                                                            to={`/profile/${user.handle}/cause/${group.handle}`}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <small className={`d-flex`}>
                                                                    <b className='white'>
                                                                        {' '}{userWithMoreData?.groupStats?.stats?.directVotesMade} votes
                                                                        {/* {' '} */}
                                                                        {/* {isSelected ? '⬆' : '⬇'} */}
                                                                    </b>
                                                                </small>
                                                                {!!userWithMoreData?.groupStats?.yourStats?.directVotesInCommon ? (
                                                                    <>
                                                                        {/* ・
                                                                        <small className="d-flex mb-0">
                                                                            <b className='white mr-1'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInCommon}</b> in common
                                                                        </small>
                                                                    */}
                                                                        ・
                                                                        <small className="d-flex align-items-center">
                                                                            <b className='white mr-1 forDirect px-1 rounded'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInAgreement} </b> same
                                                                        </small>
                                                                        ・
                                                                        <small className="d-flex align-items-center">
                                                                            <b className='white mr-1 againstDirect px-1 rounded'>{' '}{userWithMoreData?.groupStats?.yourStats?.directVotesInDisagreement}</b> differ
                                                                        </small>
                                                                    </>
                                                                ) : <span className='opacity-0'>・</span>}
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}


                                </div>
                                <GroupVisibilityPicker
                                    group={group}
                                />
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
}

