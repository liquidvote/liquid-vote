import React, { FunctionComponent, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";
import LinkSVG from "@shared/Icons/Link.svg";
import CalendarSVG from "@shared/Icons/Calendar.svg";
import LocationSVG from "@shared/Icons/Location.svg";
import AddNotificationSVG from "@shared/Icons/AddNotification.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import Header from "@shared/Header";
import VoteGraph1 from "@shared/VoteGraph1";
import { profileVotes } from "@state/Mock/Votes";
import VoteWrapper from "@shared/VoteWrapper";
import { USER } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";

import ProfileGroups from "./ProfileGroups";
import ProfileVotes from "./ProfileVotes";

import './style.sass';

export const Profile: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const profile = user_data?.User;

    const [isRepresenting, setIsRepresenting] = React.useState(false);

    // console.log({ profile, authUser });

    useEffect(() => {
        if (allSearchParams.refetch === 'user') {
            user_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    return user_loading ? (<>Loading</>) : user_error ? (<>Error</>) : (
        <>
            <Header title={profile.name} />

            <div className="profile-top">
                <div
                    className="cover"
                    style={{
                        background: profile.cover && `url(${profile.cover}) no-repeat`,
                        backgroundSize: 'cover'
                    }}
                />
                <div
                    className="profile-avatar bg"
                    style={{
                        background: profile.avatar && `url(${profile.avatar}) no-repeat`,
                        backgroundSize: 'cover'
                    }}
                />
                <div className="profile-buttons-container">
                    {/* <div className="button_">
                        <AddNotificationSVG />
                    </div> */}
                    {profile.isThisUser ? (
                        <>
                            <div
                                onClick={() => updateParams({
                                    paramsToAdd: {
                                        modal: "InviteForRepresentation",
                                        modalData: JSON.stringify({ userHandle: profile.handle })
                                    }
                                })}
                                className={`button_ small mr-1`}
                            >
                                Invite Representees
                            </div>
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
                            onClick={() => updateParams({
                                paramsToAdd: {
                                    modal: "EditRepresentativeRelation",
                                    modalData: JSON.stringify({
                                        userHandle: profile.handle,
                                        userName: profile.name
                                    })
                                }
                            })}
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
            <div className="profile-description">
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
                        >
                            {profile.externalLink}
                        </a>
                    </div>
                )}
                <div>
                    <div className="mr-1"><CalendarSVG /></div>
                    <div>Joined {profile.joinedOn}</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link to={`/profile-people/${profile.handle}/representing`}>
                    <b>{profile?.stats?.representing}</b> Representing {profile.name}
                </Link>
                <Link to={`/profile-people/${profile.handle}/represented`} className="ml-2">
                    <b>{profile?.stats?.representedBy}</b> Represented by {profile.name}
                </Link>
            </div>

            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'votes') && 'active'}`} to={`/profile/${profile.handle}/votes`}>
                        <b>{profile.directVotes}</b> Votes
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'groups' && 'active'}`} to={`/profile/${profile.handle}/groups`}>
                        <b>{profile.groups}</b> Groups
                    </Link>
                </li>
            </ul>

            <hr />

            {/* <h3>{section}</h3> */}

            {(!section || section === 'votes') && <ProfileVotes />}

            {(section === 'groups') && <ProfileGroups />}
        </>
    );
}
