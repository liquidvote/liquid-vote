import React, { FunctionComponent, useEffect } from 'react';
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@apollo/client";

import FeedSVG from "@shared/Icons/Feed.svg";
import RippleDrop from "@shared/Icons/RippleDrop.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import NotificationSvg from "@shared/Icons/Notification.svg";
import TrendingSvg from "@shared/Icons/Trending.svg";
import GroupSvg from "@shared/Icons/Group.svg";
import ThreeDotsSVG from '@shared/Icons/ThreeDots.svg';
import LoginIcon from "@shared/Icons/LoginIcon.svg";
import HashTagSvg from "@shared/Icons/HashTag.svg";
import Popper from "@shared/Popper";
import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import { useFirebaseNotifications } from '@services/firebase';

import './style.sass';

export const SideMenu: FunctionComponent<{}> = ({ }) => {

    const location = useLocation();
    const { allSearchParams, updateParams } = useSearchParams();

    const { user, isAuthenticated, isLoading: auth0_loading, loginWithRedirect, logout, loginWithPopup } = useAuth0();

    const { liquidUser, liquidUser_refetch, unseenNotificationCount } = useAuthUser();

    const { message } = useFirebaseNotifications();

    useEffect(() => {
        if (!!isAuthenticated) {

            let count = 0;
            const tryToGetUser = async () => {
                const g = await liquidUser_refetch();
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
            <Link to="/" className="hide-on-smaller-sideMenu">
                <RippleDrop />
            </Link>
            <NavLink to="/home" data-tip="Following Feed" activeClassName="active">
                <div className="notification-wrapper">
                    <FeedSVG />
                    {liquidUser ? (
                        <div className="notif-you mt-n1 small forDirect white"></div>
                    ) : null}
                </div>
            </NavLink>
            {isAuthenticated && user && (
                <>
                    <NavLink to="/notifications" data-tip="Notifications" className="notification-wrapper" activeClassName="active">
                        <NotificationSvg />
                        {unseenNotificationCount ? (
                            <div className="notif-you forDirect white">{unseenNotificationCount}</div>
                        ) : null}
                        {/* <div className="notif-representatives for white">4</div> */}
                    </NavLink>
                </>
            )}
            <NavLink to="/groups" data-tip={isAuthenticated ? "Your Causes" : " Causes"} activeClassName="active">
                <div className="notification-wrapper">
                    <GroupSvg />
                    {!liquidUser ? (
                        <div className="notif-you mt-n1 small forDirect white"></div>
                    ) : null}
                </div>
            </NavLink>

            <div className="hide-on-smaller-sideMenu">
                <br />
                <br />
                <br />
                <br />
            </div>
            {isAuthenticated && user && (
                <>
                    {location?.pathname !== `/profile/${liquidUser?.handle}` ? (
                        <Link to={`/profile/${liquidUser?.handle}`}>
                            <img
                                className="vote-avatar"
                                src={liquidUser?.avatar || 'http://images.liquid-vote.com/system/loading.gif'}
                                alt={liquidUser?.name || 'loading'}
                            />
                        </Link>

                    ) : (
                        <Popper
                            startVisible={true}
                            rightOnSmall={true}
                            button={<div>
                                <ThreeDotsSVG />
                            </div>}
                            popperContent={
                                <ul className="p-0 m-0">

                                    {liquidUser?.admin === 'total' && (
                                        <li className="pointer admin">
                                            <Link to="/admin" data-tip="Admin">
                                                {/* <AdminSvg /> */}
                                                Admin
                                            </Link>
                                        </li>
                                    )}

                                    <li
                                        className="pointer"
                                        onClick={() => updateParams({
                                            paramsToAdd: {
                                                modal: "EditProfile",
                                                modalData: JSON.stringify({ userHandle: liquidUser?.handle })
                                            }
                                        })}
                                    >
                                        Edit Profile
                                    </li>
                                    <li className="pointer" onClick={() => logout({
                                        returnTo: window.location.origin
                                    })}>Logout</li>
                                </ul>
                            }
                        />
                    )}
                    <div
                        data-tip="Create Poll"
                        className="button_ inverted icon-contain create-poll mt-3"
                        onClick={() => updateParams({
                            paramsToAdd: {
                                modal: "EditQuestion",
                                modalData: JSON.stringify({
                                    questionText: 'new'
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

