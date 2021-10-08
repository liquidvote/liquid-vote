import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";

import { useQuery } from "@apollo/client";
import DropAnimation from '@components/shared/DropAnimation';
import Header from "@shared/Header";
import PersonInList from '@shared/PersonInList';
import { USER, USER_REPRESENTED_BY, USER_REPRESENTING } from "@state/User/typeDefs";

import './style.sass';

export const ProfilePeople: FunctionComponent<{}> = ({ }) => {

    let { which, handle } = useParams<any>();

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    const {
        loading: user_representing_loading,
        error: user_representing_error,
        data: user_representing_data,
        refetch: user_representing_refetch
    } = useQuery(USER_REPRESENTING, {
        variables: { handle }
    });

    const {
        loading: user_represented_by_loading,
        error: user_represented_by_error,
        data: user_represented_by_data,
        refetch: user_represented_by_refetch
    } = useQuery(USER_REPRESENTED_BY, {
        variables: { handle }
    });

    const profile = user_data?.User;

    return user_loading ? (
        <div className="d-flex justify-content-center mt-5">
            <DropAnimation />
        </div>
    ) : user_error ? (<>Error</>) : (
        <>
            <Header title={profile.name} noBottom={true} />

            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'representing' && 'active'}`} to={`/profile-people/${profile.handle}/representing`}>
                        <b>{profile?.stats?.representing}</b> Representing {profile.name}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'representedBy' && 'active'}`} to={`/profile-people/${profile.handle}/representedBy`}>
                        <b>{profile?.stats?.representedBy}</b> Represented by {profile.name}
                    </Link>
                </li>
            </ul>

            <hr />

            {which === 'representedBy' && (
                <div className="mt-n2">
                    {user_representing_data?.UserRepresenting?.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                    {(!user_representing_data?.UserRepresenting?.length && !user_representing_loading) && (
                        <div className="p-4 text-center">{`${profile?.name} isn't represented by anyone yet.`}</div>
                    )}
                </div>
            )}

            {which === 'representing' && (
                <div className="mt-n2">
                    {user_represented_by_data?.UserRepresentedBy?.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                    {(!user_represented_by_data?.UserRepresentedBy?.length && !user_represented_by_loading) && (
                        <div className="p-4 text-center">{`${profile?.name} isn't representing anyone yet.`}</div>
                    )}
                </div>
            )}

            {(user_representing_loading || user_representing_loading) && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
        </>
    );
}

