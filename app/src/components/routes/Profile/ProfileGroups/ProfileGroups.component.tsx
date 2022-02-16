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
import './style.sass';

export const ProfileGroups: FunctionComponent<{}> = ({ }) => {

    let { handle } = useParams<any>();
    const { allSearchParams, updateParams } = useSearchParams();

    const { liquidUser } = useAuthUser();

    const {
        userGroups,
        userGroups_refetch
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

    console.log({ userGroups });

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

    return (
        <>
            {userGroups?.map((g: any, i: Number) => (
                <GroupInProfileList
                    key={g.name + i}
                    group={g}
                    alternativeButton={(
                        g.yourMemberRelation?.isMember ?
                            <div
                                onClick={
                                    () => editUserRepresentativeGroupRelation({
                                        variables: {
                                            RepresenteeHandle: liquidUser?.handle,
                                            RepresentativeHandle: user_data?.User?.handle,
                                            Group: g.handle,
                                            IsRepresentingYou: !g.representativeRelation?.isRepresentingYou
                                        }
                                    })
                                        .then((r) => {
                                            userGroups_refetch();
                                            updateParams({ paramsToAdd: { refetch: 'user' } })
                                        })
                                }
                                className={`
                            button_ small ml-1 mb-0
                            ${g.representativeRelation?.isRepresentingYou ? 'selected' : null}
                        `}
                            >
                                {
                                    g.representativeRelation?.isRepresentingYou ?
                                        `Represents you` :
                                        `Delegate to ${user_data?.User?.name}`
                                }
                            </div> :
                            null
                    )}
                />
            ))}

            {!!liquidUser && (
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

