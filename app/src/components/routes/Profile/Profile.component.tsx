import React, { FunctionComponent, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import DropAnimation from "@components/shared/DropAnimation";
import Header from "@shared/Header";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import GroupSmallSvg from "@shared/Icons/Group-small.svg";
import LinkSVG from "@shared/Icons/Link.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import ProfileSmallSVG from "@shared/Icons/Profile-small.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { timeAgo } from '@state/TimeAgo';
import { USER, USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useUserGroups from "@state/User/userGroups.effect";

import ProfileVotes from "./ProfileVotes";
import './style.sass';

export const Profile: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
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

    const {
        userGroups,
        // userGroups_refetch
    } = useUserGroups({
        userHandle: handle,
        representative: liquidUser?.handle
    });


    const [isRepresenting, setIsRepresenting] = React.useState(false);

    // console.log({ profile, authUser });

    useEffect(() => {
        if (allSearchParams.refetch === 'user') {
            user_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    return !profile ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : user_error ? (<>Error</>) : (
        <>
            <Header title={profile.name} />

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: profile.cover && `url(${profile.cover}) 50% 50% / cover no-repeat`
                    }}
                />
                <div
                    className="profile-avatar bg"
                    style={{
                        background: profile.avatar && `url(${profile.avatar}) 50% 50% / cover no-repeat`
                    }}
                />
                <div className="profile-buttons-container">
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
                    )}
                </div>
            </div>
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-handle">@{profile.handle}</p>
            <div className="profile-description pre-wrap">
                {profile.bio}
            </div>
            <div className="profile-icons-container d-flex">
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
            <div className="profile-stats-container mt-3">
                <div className="mr-1"><ProfileSmallSVG /></div>
                <Link to={`/profile-people/${profile.handle}/representedBy`} className="mr-2">
                    Representing{' '}<b className="white">{profile?.stats?.representedBy}</b>
                </Link>
                <Link to={`/profile-people/${profile.handle}/representing`} className="mr-2">
                    Represented by{' '}<b className="white">{profile?.stats?.representing}</b>
                </Link>
                {/* {profile?.yourStats?.groupsInCommon && (
                    <Link to={`/profile-people/${profile.handle}/groups`} className="mr-2">
                        <b>{profile?.yourStats?.groupsInCommon}</b> Groups in common
                    </Link>
                )} */}
            </div>

            {!!userGroups?.length && (
                <div className="mt-2 mb-3 d-flex align-items-start flex-nowrap justify-content-between">
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
            )}

            <br />

            {(!section || section === 'votes') && <ProfileVotes />}
        </>
    );
}
