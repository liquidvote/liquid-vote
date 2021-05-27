import React, { FunctionComponent } from 'react';
import Header from "@shared/Header";
import { Link, useParams } from "react-router-dom";

import PersonInList from '@shared/PersonInList';
import { people } from "@state/Mock/People";

import './style.sass';

export const GroupPeople: FunctionComponent<{}> = ({ }) => {

    let { groupName } = useParams<any>();

    return (
        <>
            <Header title={groupName} noBottom={true} />
            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link active`} to="/profile-people/representing">
                        <b>327</b> Members
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

