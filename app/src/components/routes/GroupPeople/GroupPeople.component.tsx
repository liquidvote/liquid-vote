import React, { FunctionComponent } from 'react';
import Header from "@shared/Header";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import PersonInList from '@shared/PersonInList';
import { people } from "@state/Mock/People";
import { GROUP, EDIT_GROUP, GROUP_MEMBERS } from "@state/Group/typeDefs";

import './style.sass';

export const GroupPeople: FunctionComponent<{}> = ({ }) => {

    let { handle } = useParams<any>();

    const {
        loading: group_loading,
        error: group_error,
        data: group_data,
        refetch: group_refetch
    } = useQuery(GROUP, {
        variables: { handle }
    });

    const selectedGroup = group_data?.Group;

    const {
        loading: group_members_loading,
        error: group_members_error,
        data: group_members_data,
        refetch: group_members_refetch
    } = useQuery(GROUP_MEMBERS, {
        variables: { handle }
    });

    return (
        <>
            <Header title={selectedGroup?.name} noBottom={true} />
            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link active`} to="/profile-people/representing">
                        <b>{selectedGroup?.stats?.members}</b> Members
                    </Link>
                </li>
            </ul>
            <hr />

            <div className="mt-n2">
                {/* <pre>{JSON.stringify(group_members_data?.GroupMembers, null, 2)}</pre> */}
                {group_members_data?.GroupMembers?.map((el, i) => (
                    <PersonInList person={el} />
                ))}
            </div>
        </>
    );
}

