import React, { FunctionComponent } from 'react';
import Header from "@shared/Header";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import PersonInList from '@shared/PersonInList';
import { people } from "@state/Mock/People";
import { USER } from "@state/User/typeDefs";

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

    const profile = user_data?.User;

    return user_loading ? (<>Loading</>) : user_error ? (<>Error</>) : (
        <>
            <Header title={profile.name} noBottom={true} />
            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'representing' && 'active'}`} to={`/profile-people/${profile.handle}/representing`}>
                        <b>{profile.representing}</b> Representing {profile.name}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'represented' && 'active'}`} to={`/profile-people/${profile.handle}/represented`}>
                        <b>{profile.represented}</b> Represented by {profile.name}
                    </Link>
                </li>
            </ul>
            <hr />

            <div className="mt-n2">
                {people.map((el, i) => (
                    <PersonInList person={el} />
                ))}
            </div>
        </>
    );
}

