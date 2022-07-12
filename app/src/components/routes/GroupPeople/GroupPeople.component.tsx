import React, { FunctionComponent } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import DropAnimation from "@components/shared/DropAnimation";
import Header from "@shared/Header";
import PersonInList from '@shared/PersonInList';
import useAuthUser from '@state/AuthUser/authUser.effect';
import { GROUP_MEMBERS } from "@state/Group/typeDefs";
import useGroup from '@state/Group/group.effect';
import { USER_REPRESENTED_BY, USER_REPRESENTING } from "@state/User/typeDefs";

import './style.sass';

export const GroupPeople: FunctionComponent<{}> = ({ }) => {

    let { handle, which } = useParams<any>();

    const { liquidUser } = useAuthUser();

    const { group } = useGroup({ handle });

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
            handle: liquidUser?.handle,
            groupHandle: handle
        },
        skip: !liquidUser
    });

    const {
        loading: user_represented_by_loading,
        error: user_represented_by_error,
        data: user_represented_by_data,
        refetch: user_represented_by_refetch
    } = useQuery(USER_REPRESENTED_BY, {
        variables: {
            handle: liquidUser?.handle,
            groupHandle: handle
        },
        skip: !liquidUser
    });

    return (
        <>
            <Header
                title={group?.name}
                noBottom={true}
                backLink={`/group/${group?.handle}`}
            />
            <ul className="nav d-flex justify-content-around mt-1 mb-n4 mx-n3">
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'members' && 'active'}`} to={`/group-people/${group?.handle}/members`}>
                        <b>{group?.stats?.members}</b> Members
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className={`nav-link ${which === 'youFollow' && 'active'}`} to={`/group-people/${group?.handle}/youFollow`}>
                        <b>{group?.yourStats?.membersYouFollow?.length || 0}</b> You Follow
                    </Link>
                </li>
                {
                    group?.yourStats && (
                        <>
                            <li className="nav-item">
                                <Link className={`nav-link ${which === 'representingYou' && 'active'}`} to={`/group-people/${group?.handle}/representingYou`}>
                                    <b>{group?.yourStats.representing || 0}</b> Representing you
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${which === 'representedByYou' && 'active'}`} to={`/group-people/${group?.handle}/representedByYou`}>
                                    <b>{group?.yourStats.representedBy || 0}</b> Represented By you
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
                        <PersonInList
                            key={'gp_members' + el.handle}
                            person={el}
                            groupHandle={handle}
                            groupName={group?.name}
                            includeVotes={true}
                        />
                    ))}
                    {(!group_members_data?.GroupMembers?.length && !group_members_loading) && (
                        <div className="p-4 text-center">{`This group doesn't have any members, yet!`}</div>
                    )}
                </div>
            )}

            {which === 'youFollow' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {group?.yourStats?.membersYouFollow?.map((el, i) => (
                        <PersonInList
                            key={'gp_members' + el.handle}
                            person={el}
                            groupHandle={handle}
                            groupName={group?.name}
                            includeVotes={true}
                        />
                    ))}
                    {(!group?.yourStats?.membersYouFollow?.length) && (
                        <div className="p-4 text-center">{`No members you follow, yet!`}</div>
                    )}
                </div>
            )}
            {which === 'representingYou' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {user_represented_by_data?.UserRepresentedBy?.map((el, i) => (
                        <PersonInList
                            key={'gp_representingYou' + el.handle}
                            person={el}
                            groupHandle={handle}
                            groupName={group?.name}
                            includeVotes={true}
                        />
                    ))}
                    {(!user_represented_by_data?.UserRepresentedBy?.length && !user_represented_by_loading) && (
                        <div className="p-4 text-center">{`No one is representing you in this group.`}</div>
                    )}
                </div>
            )}
            {which === 'representedByYou' && (
                // <pre>{JSON.stringify(user_representing_data?.UserRepresenting, null, 2)}</pre>
                <div className="mt-n2">
                    {user_representing_data?.UserRepresenting?.map((el, i) => (
                        <PersonInList
                            key={'gp_representedByYou' + el.handle}
                            person={el}
                            groupHandle={handle}
                            groupName={group?.name}
                            includeVotes={true}
                        />
                    ))}
                    {(!user_representing_data?.UserRepresenting?.length && !user_representing_loading) && (
                        <div className="p-4 text-center">{`No one is being represented by you in this group.`}</div>
                    )}
                </div>
            )}

            {(group_members_loading || user_representing_loading || group_members_loading) && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}
        </>
    );
}

