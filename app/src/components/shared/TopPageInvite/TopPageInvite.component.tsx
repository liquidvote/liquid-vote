import React, { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";
import GroupSvg from "@shared/Icons/Group.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import ProfileSVG from "@shared/Icons/Profile.svg";
import XSVG from "@shared/Icons/X.svg";
import useGroup from '@state/Group/group.effect';
import useUser from '@state/User/user.effect';
import DropAnimation from '@components/shared/DropAnimation';
import useAuthUser from '@state/AuthUser/authUser.effect';
import {
    EDIT_GROUP_MEMBER_CHANNEL_RELATION, EDIT_USER_REPRESENTATIVE_GROUP_RELATION
} from "@state/User/typeDefs";
import useSearchParams from "@state/Global/useSearchParams.effect";
import Avatar from "@components/shared/Avatar";

import './style.sass';

export const TopPageInvite: FunctionComponent<{
    inviterHandle: string,
    groupHandle?: string,
    voteName?: string,
    userHandle?: string,
    to: 'group' | 'poll' | 'compareWithProfile'
}> = ({
    inviterHandle,
    groupHandle,
    userHandle,
    voteName,
    to
}) => {

        const navigate = useNavigate();
        const { updateParams } = useSearchParams();
        let { handle, section, acceptOnLogin } = useParams<any>();

        const { liquidUser } = useAuthUser();
        const { user: inviter } = useUser({ userHandle: inviterHandle });
        const { user: user_ } = useUser({ userHandle });
        const { group } = useGroup({ handle: groupHandle });
        const { loginWithPopup, user, isAuthenticated, isLoading } = useAuth0();

        return (
            <div className="position-relative">
                <div
                    className="close-corner-x"
                    onClick={() =>
                        to === 'poll' ? navigate(`/poll/${voteName}/${groupHandle}`) :
                            to === 'group' ? navigate(`/group/${groupHandle}`) :
                                to === 'compareWithProfile' ? navigate(`/profile/${userHandle}`) :
                                    null
                    }
                    role="button"
                >
                    <XSVG />
                </div>


                {!!inviter ? (
                    <div className="d-flex flex-column justify-content-center">
                        <div className={`
                            ${to === 'poll' ? 'mt-2' : 'mt-4'}
                            d-flex justify-content-center align-items-center mb-3 px-5
                        `}>

                            <Link to={`/profile/${inviter?.handle}`}>
                                <Avatar
                                    person={inviter}
                                    groupHandle={group?.handle}
                                    type="small"
                                />
                            </Link>

                            <p className="m-0">
                                {to === 'group' && `${inviter?.name} is inviting you to vote with him on ${group?.name}`}
                                {to === 'poll' && `${inviter?.name} is inviting you to vote`}
                                {to === 'compareWithProfile' && `${inviter?.name} is inviting you to compare with ${inviter?.handle === user_?.handle ? "him" : user_.name}`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                )}

            </div>
        );
    }

