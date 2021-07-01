import React, { FunctionComponent } from 'react';
import { useQuery, useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import Header from "@shared/Header";
import GroupInList from "@shared/GroupInList";
import { groups } from "@state/Mock/Groups";
import { USER_GROUPS } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";

import './style.sass';

export const Groups: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const {
        loading: yourGroups_loading,
        error: yourGroups_error,
        data: yourGroups_data,
        refetch: yourGroups_refetch
    } = useQuery(USER_GROUPS, {
        variables: { handle: authUser_data?.authUser?.LiquidUser?.handle },
        skip: !authUser_data?.authUser
    });

    // console.log({ authUser_data, yourGroups_data })

    return (
        <>
            <Header title="Your Groups" />

            <div>
                {yourGroups_data?.UserGroups?.map((el: any, i: Number) => (
                    <GroupInList key={el.name + i} group={el} />
                ))}
            </div>
        </>
    );
}

