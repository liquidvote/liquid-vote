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
import { VoteTimeline } from "@state/Mock/Notifications";
import Notification from '@shared/Notification';
import GroupInList from "@shared/GroupInList";
import { groups } from "@state/Mock/Groups";
import { USER } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export default function Profile() {

    let { profileName, section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const profile = user_data?.User;
    const authUser = authUser_data?.authUser;

    const [isRepresenting, setIsRepresenting] = React.useState(false);

    console.log({ profile, authUser });

    useEffect(() => {
        if (allSearchParams.refetch === 'user') {
            user_refetch()
        }
    }, [allSearchParams.refetch]);

    return user_loading ? 'Loading' : user_error ? 'Error' : (
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
                        <div
                            onClick={() => updateParams({
                                paramsToAdd: {
                                    modal: "EditProfile",
                                    modalData: JSON.stringify({ userHandle: profile.handle })
                                }
                            })}
                            className={`button_`}
                        >
                            Edit profile
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsRepresenting(!isRepresenting)}
                            className={`button_ ${isRepresenting ? "selected" : ""}`}
                        >
                            {isRepresenting ? "Represents You" : "Delegate Votes To"}
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
                    <LocationSVG />
                    <div>{profile.location}</div>
                </div>
                <div>
                    <LinkSVG />
                    <a
                        href="//instagram.com/danpriceseattle"
                        target="_blank"
                        rel="noreferrer"
                    >
                        instagram.com/danpriceseattle
                    </a>
                </div>
                <div>
                    <CalendarSVG />
                    <div>Joined {profile.joinedOn}</div>
                </div>
            </div>
            <div className="profile-stats-container">
                <Link to="/profile-people/representing">
                    <b>{profile.representing}</b> Representing {profile.name}
                </Link>
                <Link to="/profile-people/represented" className="ml-2">
                    <b>{profile.representedBy}</b> Represented by {profile.name}
                </Link>
            </div>

            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${(!section || section === 'votes') && 'active'}`} to={`/profile/${profileName}/votes`}>
                        <b>263</b> Votes
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${section === 'members' && 'active'}`} to={`/profile/${profileName}/members`}>
                        <b>1.3K</b> Members
                    </Link>
                </li> */}
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'groups' && 'active'}`} to={`/profile/${profileName}/groups`}>
                        <b>16</b> Groups
                    </Link>
                </li>
                {/* <li className="nav-item">
                    <Link className={`nav-link ${section === 'timeline' && 'active'}`} to={`/profile/${profileName}/timeline`}>
                        Timeline
                    </Link>
                </li> */}
            </ul>

            <hr />

            {/* <h3>{section}</h3> */}

            {(!section || section === 'votes') && VoteTimeline.map((l, i) => (
                <Notification v={{
                    ...l,
                    who: {
                        name: "Dan Price",
                        avatarClass: 1,
                        representing: 12000,
                        representsYou: true,
                    },
                }} showChart={true} />
            ))}

            {(section === 'groups') && groups.map((el, i) => (
                <GroupInList group={el} />
            ))}
        </>
    );
}
