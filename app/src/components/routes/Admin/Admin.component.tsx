import React, { FunctionComponent, useState } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";

import useAuthUser from '@state/AuthUser/authUser.effect';
import useUser from '@state/User/user.effect';

import Causes from './sections/Causes';

import './style.sass';


export const Admin: FunctionComponent<{}> = ({ }) => {

    let { section } = useParams<any>();
    const { liquidUser } = useAuthUser();
    const { user: yourUser } = useUser({ userHandle: liquidUser?.handle });

    return (
        <>
            <Header
                title="Admin"
            />

            <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${!section && 'active'}`} to={`/admin`}>
                        Causes
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'users' && 'active'}`} to={`/admin/users`}>
                        Users
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${section === 'polls' && 'active'}`} to={`/admin/polls`}>
                        Polls
                    </Link>
                </li>
            </ul>

            <div className="mt-3">
                {!section && (
                    <Causes />
                )}
                {section === 'users' && ('TODO: show Users')}
                {section === 'polls' && ('TODO: show Polls')}
            </div>
        </>
    );
}

