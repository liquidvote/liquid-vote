import React, { FunctionComponent, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import DropAnimation from "@components/shared/DropAnimation";
import Header from "@shared/Header";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import HandshakeSVG from "@shared/Icons/Handshake.svg";
import LinkSVG from "@shared/Icons/Link-small.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import ProfileSmallSVG from "@shared/Icons/Profile-small.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { timeAgo } from '@state/TimeAgo';
import { USER, EDIT_USER_FOLLOWING_RELATION } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import MetaTags from "@components/shared/MetaTags";
import Avatar from "@components/shared/Avatar";
import InviteTinySvg from "@shared/Icons/Invite-tiny.svg";
import env from '@env';
import TopPageInvite from '@components/shared/TopPageInvite';

import './style.sass';
import ProfileGroups from "./ProfileGroups";
import ProfilePolls from "./ProfilePolls";
import ProfileFollowings from "./ProfileFollowings";

export const Profile: FunctionComponent<{}> = ({ }) => {

    let { section, handle, groupHandle, inviterHandle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const profile = user_data?.User;

    const [editUserFollowingRelation, {
        loading: editUserFollowingRelation_loading,
        error: editUserFollowingRelation_error,
        data: editUserFollowingRelation_data,
    }] = useMutation(EDIT_USER_FOLLOWING_RELATION);

    useEffect(() => {
        if (allSearchParams.refetch === 'user') {
            user_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    console.log({ profile });

    return !profile ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : user_error ? (<>Error</>) : (
        <>
            <MetaTags
                title={profile?.name}
                description={profile?.bio}
                image={profile?.avatar}
            // url={``}
            />

            <Header title={profile?.name} />

            {!!inviterHandle && (
                <div className="mb-3">
                    <TopPageInvite
                        inviterHandle={inviterHandle}
                        userHandle={handle}
                        to="compareWithProfile"
                    />
                </div>
            )}

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: profile.cover && `url(${profile.cover}) 50% 50% / cover no-repeat`
                    }}
                />
                <div className="avatar-wrapper">
                    <Avatar person={profile} type="profile" />
                </div>
                <div className="profile-buttons-container">
                    <div
                        className="button_ small mb-2 mr-2"
                        onClick={async () => {
                            const inviteLink = `${env.website}/invite/by/${liquidUser?.handle}/toCompareWith/${profile.handle}`;

                            try {
                                await navigator.share({
                                    title: `Compare with with ${profile.name}`,
                                    text: `${liquidUser?.name} is inviting you to compare ${liquidUser?.handle === profile.handle ? 'with him' : `with ${profile.name}`}`,
                                    url: inviteLink
                                })

                            } catch (err) {
                                updateParams({
                                    paramsToAdd: {
                                        modal: "InviteFor",
                                        modalData: JSON.stringify({
                                            InviteType: 'toCompare',
                                            userHandle: profile.handle,
                                            userName: profile.name,
                                            inviteLink
                                        })
                                    }
                                })
                            }
                        }}
                    >
                        <InviteTinySvg />
                    </div>
                    {profile.isThisUser ? (
                        <>
                            <div
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "EditProfile",
                                        modalData: JSON.stringify({ userHandle: profile.handle })
                                    }
                                })}
                                className={`button_ small`}
                            >
                                Edit profile
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                // onClick={() => setIsRepresenting(!isRepresenting)}
                                onClick={() => !!liquidUser ? editUserFollowingRelation({
                                    variables: {
                                        FollowedHandle: profile?.handle,
                                        FollowingHandle: liquidUser?.handle,
                                        IsFollowing: !profile.isYouFollowing
                                    }
                                })
                                    .then((r) => {
                                        console.log({ r });
                                        user_refetch();
                                    }) : (
                                    updateParams({
                                        paramsToAdd: {
                                            modal: "RegisterBefore",
                                            modalData: JSON.stringify({
                                                toWhat: 'followUser',
                                                userName: profile.name
                                            })
                                        }
                                    })
                                )}
                                className={`button_ small mr-2 ${profile.isYouFollowing ? "selected" : ""}`}
                            >
                                {
                                    profile.isYouFollowing ?
                                        "Following" :
                                        "Follow"
                                }
                            </div>
                            {profile.isRepresentingYou ? (
                                <div
                                    // onClick={() => setIsRepresenting(!isRepresenting)}
                                    onClick={() => !!liquidUser ? updateParams({
                                        paramsToAdd: {
                                            modal: "EditRepresentativeRelation",
                                            modalData: JSON.stringify({
                                                userHandle: profile.handle,
                                                userName: profile.name
                                            })
                                        }
                                    }) : (
                                        updateParams({
                                            paramsToAdd: {
                                                modal: "RegisterBefore",
                                                modalData: JSON.stringify({
                                                    toWhat: 'delegating',
                                                    userName: profile.name
                                                })
                                            }
                                        })
                                    )}
                                    className={`button_ small ${profile.isRepresentingYou ? "selected" : ""}`}
                                >
                                    {
                                        profile.isRepresentingYou ?
                                            `Represents you in ${profile.isRepresentingYou} group` :
                                            "Delegate Votes To"
                                    }
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
            <h2 className="profile-name white mt-2">{profile.name}</h2>
            <div className="d-flex align-items-center">
                <p className="profile-handle">@{profile.handle}</p>
                {profile.followsYou ? (
                    <small
                        className={`badge ml-2 mt-n1`}
                    >follows you</small>
                ) : null}
            </div>
            <div className="profile-description pre-wrap">
                {profile.bio}
            </div>
            {/* <pre>{JSON.stringify(profile, null, 2)}</pre> */}
            <div className="profile-icons-container d-flex mt-2">
                <div>
                    <div className="mr-1"><LocationSVG /></div>
                    <div>{profile.location}</div>
                </div>
                {profile.externalLink && (
                    <div>
                        <div className="mr-1"><LinkSVG /></div>
                        <a
                            href={profile.externalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="white"
                        >
                            {profile.externalLink}
                        </a>
                    </div>
                )}
                <div>
                    <div className="mr-1"><CalendarSVG /></div>
                    <div>Joined {timeAgo.format(new Date(Number(profile.joinedOn)))}</div>
                </div>
            </div>

            <div>
                <div className="profile-stats-container mt-3 flex-nowrap">
                    <div className="mr-1"><ProfileSmallSVG /></div>
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-wrap align-items-center">
                            <Link to={`/profile-follows/${profile.handle}/followedby`} className="mr-2">
                                Following {' '}<b className="white">{profile?.stats?.following || 0}</b>
                            </Link>
                            <Link to={`/profile-follows/${profile.handle}/following`} className="mr-2">
                                Followed by{' '}<b className="white">{profile?.stats?.followedBy || 0}</b>
                            </Link>
                        </div>
                        {/* {(profile?.stats?.representedBy || profile?.stats?.representing) ? (
                            <div className="d-flex flex-wrap">
                                <Link to={`/profile-people/${profile.handle}/representedBy`} className="mr-2">
                                    Representing{' '}<b className="white">{profile?.stats?.representedBy}</b>
                                </Link>
                                <Link to={`/profile-people/${profile.handle}/representing`} className="mr-2">
                                    Represented by{' '}<b className="white">{profile?.stats?.representing}</b>
                                </Link>
                            </div>
                        ) : null} */}
                    </div>
                </div>
                <small className="">Not followed by anyone you follow</small>
            </div>

            <div>
                {(profile?.stats?.representedBy || profile?.stats?.representing) ? (
                    <div className="profile-stats-container mt-3 flex-nowrap">
                        <div className="mr-1"><HandshakeSVG /></div>
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-wrap">
                                <Link to={`/profile-people/${profile.handle}/representedBy`} className="mr-2">
                                    Representing{' '}<b className="white">{profile?.stats?.representedBy || 0}</b>
                                </Link>
                                <Link to={`/profile-people/${profile.handle}/representing`} className="mr-2">
                                    Represented by{' '}<b className="white">{profile?.stats?.representing || 0}</b>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null}
                {/* <small className="">Not represented by anyone you follow</small> */}
            </div>
            {/* {profile?.yourStats?.groupsInCommon && (
                    <Link to={`/profile-people/${profile.handle}/groups`} className="mr-2">
                        <b>{profile?.yourStats?.groupsInCommon}</b> Groups in common
                    </Link>
                )} */}

            {/* <div className="profile-stats-container mb-2 mt-2 flex-nowrap">
                <div className="mr-1"><DropSVG /></div>

                <div>
                    <div className="d-flex flex-wrap">
                        <Link
                            to={`/profile/${profile?.handle}/votes/direct`}
                            className="mr-2 pointer"
                        >
                            <b className="white">{(
                                profile?.stats.directVotesMade
                            ) || 0}</b> Direct Votes
                        </Link>

                        {!!profile?.yourStats && (
                            <>
                                <Link
                                    to={`/profile/${profile?.handle}/votes/direct/same`}
                                    className="mr-2 pointer"
                                >
                                    <b className="white forDirect px-1 rounded">{(
                                        profile?.yourStats.directVotesInAgreement
                                    ) || 0}</b> Same as yours
                                </Link>
                                <Link
                                    to={`/profile/${profile?.handle}/votes/direct/different`}
                                    className="mr-2 pointer"
                                >
                                    <b className="white againstDirect px-1 rounded">{(
                                        profile?.yourStats.directVotesInDisagreement
                                    ) || 0}</b> Different
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="d-flex flex-wrap">
                        <Link
                            to={`/profile/${profile?.handle}/votes/represented`}
                            className="mr-2 pointer"
                        >
                            <b className="white">{(
                                profile?.stats.indirectVotesMadeByUser
                            ) || 0}</b> Represented Votes
                        </Link>

                        {!!profile?.yourStats && (
                            <>
                                <Link
                                    to={`/profile/${profile?.handle}/votes/represented/byyou`}
                                    className="mr-2 pointer"
                                >
                                    <b className="white">{(
                                        profile?.yourStats.indirectVotesMadeByYou
                                    ) || 0}</b> By You
                                </Link>
                                <Link
                                    to={`/profile/${profile?.handle}/votes/represented/foryou`}
                                    className="mr-2 pointer"
                                >
                                    <b className="white">{(
                                        profile?.yourStats.indirectVotesMadeForYou
                                    ) || 0}</b> For You
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div> */}


            {/* 
            
                // directVotesMade: 14
                groupsJoined: 4
                indirectVotesMadeByUser: 1
                indirectVotesMadeForUser: 1
                lastDirectVoteOn: "0"
                representedBy: 3
                representing: 1

                // directVotesInAgreement: 4
                directVotesInCommon: 11
                // directVotesInDisagreement: 7
                // indirectVotesMadeByYou: 1
                // indirectVotesMadeForYou: 1
                votesInCommon: 13
            
            */}

            {/* {
                !!userGroups?.length && (
                    <div className="mt-1 mb-3 d-flex align-items-start flex-nowrap justify-content-between">
                        <div className="d-flex flex-column">
                            <div
                                className="d-flex flex-wrap justify-content-start"
                            >
                                <div data-tip="User Groups">
                                    <GroupSmallSvg />
                                </div>
                                {userGroups?.map((el: any, i: any) => (
                                    <Link
                                        to={`/group/${el.handle}`}
                                        key={'s-' + el.name}
                                        className={`badge inverted ml-1 mb-1 mt-1`}
                                    >{el.name}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            } */}

            <br />

            <ul className="nav d-flex justify-content-around mt-n2 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'groups') && 'active'}`} to={`/profile/${handle}/groups`}>
                        <b>{profile?.stats?.groupsJoined}</b> Causes
                    </Link>
                </li>
                {profile?.stats?.pollsCreated ? (
                    <li className="nav-item">
                        <Link className={`nav-link ${section === 'polls' && 'active'}`} to={`/profile/${handle}/polls`}>
                            <b>{profile?.stats?.pollsCreated}</b> Polls Launched
                        </Link>
                    </li>
                ) : null}
            </ul>

            <hr className="mt-n4" />

            {(!section || section === 'groups' || !!groupHandle) && <ProfileGroups />}
            {(section === 'polls') && <ProfilePolls userHandle={profile.handle} user={profile} />}
            {(section === 'followings') && <ProfileFollowings />}
        </>
    );
}
