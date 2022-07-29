import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import GroupInList from "@shared/GroupInList";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import DropAnimation from '@components/shared/DropAnimation';
import useSearchParams from "@state/Global/useSearchParams.effect";
import useUser from '@state/User/user.effect';

import './style.sass';

export const Groups: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();
    const { user } = useUser({ userHandle: liquidUser?.handle });

    const {
        loading: yourGroups_loading,
        error: yourGroups_error,
        data: yourGroups_data,
        refetch: yourGroups_refetch
    } = useQuery(USER_GROUPS, {
        variables: {
            handle: liquidUser?.handle,
            notUsers: section === 'other' || !liquidUser
        },
        // skip: !liquidUser
    });

    // console.log({ authUser_data, yourGroups_data })

    return (
        <>
            <Header title="Causes" />

            {!!liquidUser && (
                <ul className="nav d-flex flex-nowrap justify-content-around align-items-center mt-1 mx-n3">
                    <li className="nav-item">
                        <Link className={`nav-link ${!section && 'active'}`} to={`/groups`}>
                            <b>{user?.stats?.groupsJoined || 0}</b>Joined
                        </Link>
                    </li>
                    {/* {section === 'other' && ( */}
                        <li className="nav-item">
                            <Link className={`nav-link ${section === 'other' && 'active'}`} to={`/groups/other`}>
                                🧪 Other
                            </Link>
                        </li>
                    {/* )} */}
                </ul>
            )}

            {
                !yourGroups_data && (
                    <div className="d-flex align-items-center justify-content-center min-vh-100 mt-n5">
                        <DropAnimation />
                    </div>
                )
            }

            <div>
                {yourGroups_data?.UserGroups?.map((el: any, i: Number) => (
                    <GroupInList key={el.name + i} group={el} />
                ))}

                {(!yourGroups_data?.UserGroups?.length && !!yourGroups_data) && (
                    <div className="p-4 text-center">
                        You aren't a member of any group yet.
                    </div>
                )}
            </div>


            {(!!liquidUser && !yourGroups_loading) && (
                <div className="d-flex justify-content-center">
                    <div onClick={() => updateParams({
                        paramsToAdd: {
                            modal: 'EditGroup',
                            modalData: JSON.stringify({ groupHandle: 'new' })
                        }
                    })} className="button_ m-5">
                        {/* <DropPlusSVG /> */}
                        <div className="ml-2">Create a New Group</div>
                    </div>
                </div>
            )}
        </>
    );
}

