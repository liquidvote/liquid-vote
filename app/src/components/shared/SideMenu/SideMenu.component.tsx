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

    const { user, isAuthenticated, isLoading, loginWithRedirect, logout, loginWithPopup } = useAuth0();

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const { authUser } = authUser_data || {};

    useEffect(() => {
        if (isAuthenticated) {

            let count = 0;
            const tryToGetUser = async () => {
                const g = await authUser_refetch();
                count = count + 1;

                // console.log({ count, g });

                if (!g?.data?.authUser) {
                    setTimeout(() => tryToGetUser(), 100 + (count * 50));
                }
                
            };
            tryToGetUser();
        }
    }, [isAuthenticated]);

    return (
        <div className="sideMenu">
            <Link to="/home" className="hide-on-smaller-sideMenu">
                <RippleDrop />
            </Link>
            <Link to="/home" data-tip="Home">
                <HomeSvg />
            </Link>
            {isAuthenticated && user && (
                <>
                    <Link to="/feed" data-tip="Notifications">
                        <NotificationSvg />
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
            <div className="hide-on-smaller-sideMenu">
                <br />
                <br />
                <br />
                <br />
            </div>
            {isAuthenticated && user && (
                <>
                    <Popper
                        rightOnSmall={true}
                        button={<div>
                            <img
                                className="vote-avatar"
                                src={authUser?.LiquidUser?.avatar || 'http://images.liquid-vote.com/system/loading.gif'}
                                alt={authUser?.LiquidUser?.name || 'loading'}
                            />
                        </div>}
                        popperContent={
                            <ul className="p-0 m-0">
                                <li>
                                    {!!authUser ?
                                        <Link to={`/profile/${authUser?.LiquidUser?.handle}`}>Visit Profile</Link> :
                                        'loading...'
                                    }
                                </li>
                                <li className="pointer" onClick={() => logout({
                                    returnTo: window.location.origin
                                })}>Logout</li>
                            </ul>
                        }
                    />
                    <div
                        data-tip="Create Poll"
                        className="button_ inverted icon-contain hide-on-smaller-sideMenu mt-3"
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
                    <div
                        className="pointer"
                        onClick={() => loginWithPopup({
                            // redirectUri: window.location.origin
                        })}
                        data-tip="Login"
                    >
                        <LoginIcon />
                    </div>
                </>
            )}
        </div>
    );
}

