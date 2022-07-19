import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";

import { useQuery } from "@apollo/client";
import DropAnimation from '@components/shared/DropAnimation';
import Header from "@shared/Header";
import PersonInList from '@shared/PersonInList';
import { USER, USER_FOLLOWED_BY, USER_FOLLOWING } from "@state/User/typeDefs";

import './style.sass';

export const ProfileFollowings: FunctionComponent<{}> = ({ }) => {

    let { which, handle } = useParams<any>();

    // console.log({  which, handle });

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const {
        loading: user_following_loading,
        error: user_following_error,
        data: user_following_data,
        refetch: user_following_refetch
    } = useQuery(USER_FOLLOWING, {
        variables: { handle }
    });

    const {
        loading: user_followed_by_loading,
        error: user_followed_by_error,
        data: user_followed_by_data,
        refetch: user_followed_by_refetch
    } = useQuery(USER_FOLLOWED_BY, {
        variables: { handle }
    });

    // console.log({ user_following_data, user_followed_by_data });

    const profile = user_data?.User;

    return user_loading ? (
        <div className="d-flex align-items-center justify-content-center min-vh-100 mt-n5">
            <DropAnimation />
        </div>
    ) : user_error ? (<>Error</>) : (
        <>
            <Header title={profile.name} noBottom={true} />

            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'following' && 'active'}`} to={`/profile-follows/${profile.handle}/following`}>
                        Followed by <b>{profile?.stats?.followedBy || 0}</b>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'followedby' && 'active'}`} to={`/profile-follows/${profile.handle}/followedby`}>
                        Following <b>{profile?.stats?.following || 0}</b>
                    </Link>
                </li>
            </ul>

            <hr />

            {which === 'followedby' && (
                <div className="mt-n2">
                    {user_following_data?.UserFollowing?.map((el, i) => (
                        <PersonInList
                            key={'pf_followedby'+el.handle}
                            person={el}
                        />
                    ))}
                    {(!user_following_data?.UserFollowing?.length && !user_following_loading) && (
                        <div className="p-4 text-center">{`${profile?.name} isn't following anyone yet.`}</div>
                    )}
                </div>
            )}

            {which === 'following' && (
                <div className="mt-n2">
                    {user_followed_by_data?.UserFollowedBy?.map((el, i) => (
                        <PersonInList
                            key={'pf_following'+el.handle}
                            person={el}
                        />
                    ))}
                    {(!user_followed_by_data?.UserFollowedBy?.length && !user_followed_by_loading) && (
                        <div className="p-4 text-center">{`${profile?.name} isn't followed by anyone yet.`}</div>
                    )}
                </div>
            )}

            {(user_following_loading || user_following_loading) && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
        </>
    );
}

