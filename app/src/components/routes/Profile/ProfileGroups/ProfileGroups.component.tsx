import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import GroupInList from "@shared/GroupInList";
import { groups } from "@state/Mock/Groups";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';

export const ProfileGroups: FunctionComponent<{}> = ({ }) => {

    let { handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    const {
        loading: profileGroups_loading,
        error: profileGroups_error,
        data: profileGroups_data,
        refetch: profileGroups_refetch
    } = useQuery(USER_GROUPS, { variables: { handle } });

    console.log({ profileGroups_data });

    useEffect(() => {
        if (allSearchParams.refetch === 'group') {
            profileGroups_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    return (
        <>

            {!!liquidUser && (
                <div onClick={() => updateParams({
                    paramsToAdd: {
                        modal: 'EditGroup',
                        modalData: JSON.stringify({ groupHandle: 'new' })
                    }
                })} className="button_ mx-5 my-3">
                    {/* <DropPlusSVG /> */}
                    <div className="ml-2">Create New Group</div>
                </div>
            )}

            {profileGroups_data?.UserGroups?.map((el: any, i: Number) => (
                <GroupInList key={el.name + i} group={el} />
            ))}
        </>
    );
}

