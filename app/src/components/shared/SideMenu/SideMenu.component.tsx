import React, { FunctionComponent, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@apollo/client";

import HomeSvg from "@shared/Icons/Home.svg";
import RippleDrop from "@shared/Icons/RippleDrop.svg";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import NotificationSvg from "@shared/Icons/Notification.svg";
import TrendingSvg from "@shared/Icons/Trending.svg";
import GroupSvg from "@shared/Icons/Group.svg";
import ThreeDotsSVG from '@shared/Icons/ThreeDots.svg';
import LoginIcon from "@shared/Icons/LoginIcon.svg";
import Popper from "@shared/Popper";
import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';

export const SideMenu: FunctionComponent<{}> = ({ }) => {

    const history = useHistory();
    const { allSearchParams, updateParams } = useSearchParams();

    const { user, isAuthenticated, isLoading, loginWithRedirect, logout, loginWithPopup } = useAuth0();

    const { liquidUser, liquidUser_refetch } = useAuthUser();

    console.log({
        p: history?.location?.pathname
    });

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
            <Link to="/home" data-tip="Home">
                <HomeSvg />
            </Link>
            {isAuthenticated && user && (
                <>
                    {/* <Link to="/notifications" data-tip="Notifications">
                        <NotificationSvg />
                    </Link> */}
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
                    {history?.location?.pathname !== `/profile/${liquidUser?.handle}` ? (
                        <Link to={`/profile/${liquidUser?.handle}`}>
                            <img
                                className="vote-avatar"
                                src={liquidUser?.avatar || 'http://images.liquid-vote.com/system/loading.gif'}
                                alt={liquidUser?.name || 'loading'}
                            />
                        </Link>

                    ) : (
                        <Popper
                            rightOnSmall={true}
                            button={<div>
                                {/* <img
                                    className="vote-avatar"
                                    src={liquidUser?.avatar || 'http://images.liquid-vote.com/system/loading.gif'}
                                    alt={liquidUser?.name || 'loading'}
                                /> */}
                                <ThreeDotsSVG />
                            </div>}
                            popperContent={
                                <ul className="p-0 m-0">
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
                        className="button_ inverted icon-contain hide-on-smaller-sideMenu mt-3"
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

