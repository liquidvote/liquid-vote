import React, { FunctionComponent } from 'react';
import Header from "@shared/Header";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import PersonInList from '@shared/PersonInList';
import { people } from "@state/Mock/People";
import { GROUP, EDIT_GROUP, GROUP_MEMBERS } from "@state/Group/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import { USER_REPRESENTING, USER_REPRESENTED_BY } from "@state/User/typeDefs";

import './style.sass';

export const GroupPeople: FunctionComponent<{}> = ({ }) => {

    let { handle, which } = useParams<any>();

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authUser = authUser_data?.authUser;

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

    const {
        loading: user_representing_loading,
        error: user_representing_error,
        data: user_representing_data,
        refetch: user_representing_refetch
    } = useQuery(USER_REPRESENTING, {
        variables: {
            handle: authUser?.LiquidUser?.handle,
            groupHandle: handle
        },
        skip: !authUser
    });

    const {
        loading: user_represented_by_loading,
        error: user_represented_by_error,
        data: user_represented_by_data,
        refetch: user_represented_by_refetch
    } = useQuery(USER_REPRESENTED_BY, {
        variables: {
            handle: authUser?.LiquidUser?.handle,
            groupHandle: handle
        },
        skip: !authUser
    });

    return (
        <>
            <Header
                title={selectedGroup?.name}
                noBottom={true}
                backLink={`/group/${selectedGroup?.handle}`}
            />
            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'members' && 'active'}`} to={`/group-people/${selectedGroup?.handle}/members`}>
                        <b>{selectedGroup?.stats?.members}</b> Members
                    </Link>
                </li>
                {
                    selectedGroup?.yourStats && (
                        <>
                            <li className="nav-item">
                                <Link className={`nav-link ${which === 'representingYou' && 'active'}`} to={`/group-people/${selectedGroup?.handle}/representingYou`}>
                                    <b>{selectedGroup?.yourStats.representing || 0}</b> Representing you
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${which === 'representedByYou' && 'active'}`} to={`/group-people/${selectedGroup?.handle}/representedByYou`}>
                                    <b>{selectedGroup?.yourStats.representedBy || 0}</b> Represented By you
                                </Link>
                            </li>
                        </>
                    )
                }
            </ul>
            <hr />

            {/*
                members
                representingYou
                representedByYou
            */}

            {which === 'members' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {group_members_data?.GroupMembers?.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                    {!group_members_data?.GroupMembers?.length && (
                        <>{`This group doesn't have any members, yet!`}</>
                    )}
                </div>
            )}
            {which === 'representingYou' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {user_represented_by_data?.UserRepresentedBy?.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                    {!user_represented_by_data?.UserRepresentedBy?.length && (
                        <>{`No one is representing you in this group.`}</>
                    )}
                </div>
            )}
            {which === 'representedByYou' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {user_representing_data?.UserRepresenting?.map((el, i) => (
                        <PersonInList person={el} />
                    ))}
                    {!user_representing_data?.UserRepresenting?.length && (
                        <>{`No one is being represented by you in this group.`}</>
                    )}
                </div>
            )}
        </>
    );
}

