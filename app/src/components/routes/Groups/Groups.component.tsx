import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

import Header from "@shared/Header";
import GroupInList from "@shared/GroupInList";
import { USER_GROUPS } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import DropAnimation from '@components/shared/DropAnimation';
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const Groups: FunctionComponent<{}> = ({ }) => {

    let { section, handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    const {
        loading: yourGroups_loading,
        error: yourGroups_error,
        data: yourGroups_data,
        refetch: yourGroups_refetch
    } = useQuery(USER_GROUPS, {
        variables: { handle: liquidUser?.handle },
        skip: !liquidUser
    });

    // console.log({ authUser_data, yourGroups_data })

    return (
        <>
            <Header title="Your Groups" />

            {
                !yourGroups_data && (
                    <div className="d-flex justify-content-center mt-5">
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


            {(!!authUser_data?.authUser &&  !yourGroups_loading) && (
                <div onClick={() => updateParams({
                    paramsToAdd: {
                        modal: 'EditGroup',
                        modalData: JSON.stringify({ groupHandle: 'new' })
                    }
                })} className="button_ m-5">
                    {/* <DropPlusSVG /> */}
                    <div className="ml-2">Create a New Group</div>
                </div>
            )}
        </>
    );
}

