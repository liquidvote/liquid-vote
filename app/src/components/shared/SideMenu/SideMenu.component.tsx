import React, { FunctionComponent } from 'react';
import { Link } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import { useAuth0 } from "@auth0/auth0-react";

import HomeSvg from "@shared/Icons/Home.svg";
import RippleDrop from "@shared/Icons/RippleDrop.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import NotificationSvg from "@shared/Icons/Notification.svg";
import ProfileSvg from "@shared/Icons/Profile.svg";
import ProfilePlusSvg from "@shared/Icons/Profile+.svg";
import TrendingSvg from "@shared/Icons/Trending.svg";
import GroupSvg from "@shared/Icons/Group.svg";

import './style.sass';

export const SideMenu: FunctionComponent<{}> = ({ }) => {

    const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

    console.log({
        user,
        isAuthenticated,
        isLoading
    });

    return (
        <div className="sideMenu">
            <ReactTooltip place="bottom" type="dark" effect="solid" />
            <Link to="/">
                <RippleDrop />
            </Link>
            <Link to="home" data-tip="Home">
                <HomeSvg />
            </Link>
            <Link to="/feed" data-tip="Notifications">
                <NotificationSvg />
            </Link>
            <Link to="/trending" data-tip="Trending" className="d-block d-md-none">
                <TrendingSvg />
            </Link>
            <Link to="/groups" data-tip="Your Groups">
                <GroupSvg />
            </Link>
            {/* <Link to="/feed">
                <BookmarkSvg />
            </Link>
            <Link to="/feed">
                <AnalyticsSvg />
            </Link> */}
            <br />
            <br />
            <br />
            <br />
            {isAuthenticated && user && (
                <>
                    <Link to="/profile" data-tip="Demo Profile">
                        <img className="vote-avatar" src={user?.picture} alt={user?.name} />
                    </Link>
                    <div className="pointer"  onClick={() => logout({ returnTo: window.location.origin })} data-tip="Logout">
                        <HomeSvg />
                    </div>
                </>
            )}
            {!isAuthenticated && (
                <div className="pointer" onClick={() => loginWithRedirect({ redirectUri: window.location.origin })} data-tip="Login">
                    <ProfilePlusSvg />
                </div>
            )}
            <Link to="/create-vote" data-tip="Create Poll" className="button_ inverted icon-contain">
                <DropPlusSVG />
            </Link>
        </div>
    );
}

