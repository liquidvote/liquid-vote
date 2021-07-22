import React, { FunctionComponent, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@apollo/client";

import HomeSvg from "@shared/Icons/Home.svg";
import RippleDrop from "@shared/Icons/RippleDrop.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import NotificationSvg from "@shared/Icons/Notification.svg";
import TrendingSvg from "@shared/Icons/Trending.svg";
import GroupSvg from "@shared/Icons/Group.svg";
import LoginIcon from "@shared/Icons/LoginIcon.svg";
import Popper from "@shared/Popper";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { AUTH_USER } from "@state/AuthUser/typeDefs";

import './style.sass';

export const SideMenu: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();

    const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

    const { loading: authUser_loading, error: authUser_error, data: authUser_data, refetch: authUser_refetch } = useQuery(AUTH_USER);

    const { authUser } = authUser_data || {};

    useEffect(() => {
        if (isAuthenticated) {
            setTimeout(() => authUser_refetch(), 100);
            setTimeout(() => authUser_refetch(), 1000);
            setTimeout(() => authUser_refetch(), 5000);
        }
    }, [isAuthenticated]);

    return (
        <div className="sideMenu">
            <Link to="/home">
                <RippleDrop />
            </Link>
            <Link to="home" data-tip="Home">
                <HomeSvg />
            </Link>
            {isAuthenticated && user && (
                <>
                    <Link to="/feed" data-tip="Notifications">
                        <NotificationSvg />
                    </Link>
                    <Link to="/trending" data-tip="Trending" className="d-block d-md-none">
                        <TrendingSvg />
                    </Link>
                    <Link to="/groups" data-tip="Your Groups">
                        <GroupSvg />
                    </Link>
                </>
            )}
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
                    <Popper
                        button={<div>
                            <img
                                className="vote-avatar mb-3"
                                src={authUser?.LiquidUser?.avatar}
                                alt={authUser?.LiquidUser?.name}
                            />
                        </div>}
                        popperContent={
                            <ul className="p-0 m-0">
                                <li><Link to={`/profile/${authUser?.LiquidUser?.handle}`}>Visit Profile</Link></li>
                                <li className="pointer" onClick={() => logout({ returnTo: window.location.origin })}>Logout</li>
                            </ul>
                        }
                    />
                    <div
                        data-tip="Create Poll"
                        className="button_ inverted icon-contain"
                        onClick={() => updateParams({
                            paramsToAdd: {
                                modal: "EditQuestion",
                                modalData: JSON.stringify({
                                    questionHandle: 'new'
                                })
                            }
                        })}
                    >
                        <DropPlusSVG />
                    </div>
                </>
            )}
            {!isAuthenticated && (
                <>
                    <div className="pointer" onClick={() => loginWithRedirect({ redirectUri: window.location.origin })} data-tip="Login">
                        <LoginIcon />
                    </div>
                </>
            )}
        </div>
    );
}

