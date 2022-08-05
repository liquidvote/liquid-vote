import React, { FunctionComponent, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import GroupInProfileList from "./GroupInProfileList";
import { groups } from "@state/Mock/Groups";
import DropPlusSVG from "@shared/Icons/Drop+.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, USER_GROUPS, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useUserGroups from '@state/User/userGroups.effect';
import DropAnimation from '@components/shared/DropAnimation';
import './style.sass';

export const ProfileGroups: FunctionComponent<{}> = () => {

    let { handle, groupHandle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    const {
        userGroups,
        userGroups_refetch,
        userGroups_loading
    } = useUserGroups({
        userHandle: handle,
        representative: handle
    });

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle }
    });

    useEffect(() => {
        if (allSearchParams.refetch === 'group') {
            userGroups_refetch();
            updateParams({ keysToRemove: ['refetch'] })
        }
    }, [allSearchParams.refetch]);

    const [editUserRepresentativeGroupRelation, {
        loading: editUserRepresentativeGroupRelation_loading,
        error: editUserRepresentativeGroupRelation_error,
        data: editUserRepresentativeGroupRelation_data,
    }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION);

    useEffect(() => {
        if (groupHandle) {
            document?.getElementById?.(groupHandle)?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [userGroups_loading]);

    return (
        <>
            <div className="mt-n3">
                {userGroups?.map((g: any, i: Number) => (
                    <GroupInProfileList
                        key={'profile-cause' + g.name + i}
                        group={g}
                        user={user_data?.User}
                        isSelected={groupHandle === g.handle}
                    />
                ))}
            </div>

            {userGroups_loading && (
                <div className="d-flex justify-content-center mt-5">
                    <DropAnimation />
                </div>
            )}

            {!!liquidUser && liquidUser.handle === handle && (
                <div className="d-flex justify-content-center">
                    <div onClick={() => updateParams({
                        paramsToAdd: {
                            modal: 'EditGroup',
                            modalData: JSON.stringify({ groupHandle: 'new' })
                        }
                    })} className="button_ mx-5 my-3">
                        {/* <DropPlusSVG /> */}
                        <div className="ml-2">Start a new cause</div>
                    </div>
                </div>
            )}
        </>
    );
}

