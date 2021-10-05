import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, USER_GROUPS, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useUserGroups from '@state/User/userGroups.effect';
import DropAnimation from "@components/shared/DropAnimation";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const EditRepresentativeRelation: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const { liquidUser } = useAuthUser();
    const {
        userGroups: yourGroups,
        userGroups_refetch: yourGroups_refetch
    } = useUserGroups({
        userHandle: liquidUser?.handle,
        representative: modalData?.userHandle
    });

    const {
        loading: representative_loading,
        error: representative_error,
        data: representative_data,
        refetch: representative_refetch
    } = useQuery(USER, {
        variables: { handle: modalData.userHandle },
        skip: modalData.userHandle === "new"
    });

    const [editUserRepresentativeGroupRelation, {
        loading: editUserRepresentativeGroupRelation_loading,
        error: editUserRepresentativeGroupRelation_error,
        data: editUserRepresentativeGroupRelation_data,
    }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION);

    useEffect(() => {
        console.log({
            representative_data,
            modalData
        })
    }, [representative_data]);

    return (
        <form>

            <ModalHeader
                title={`Delegate Votes to ${modalData?.userName}`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">
                <label className="mt-4">Groups in common:</label>

                <div>
                    {!!yourGroups && [
                        ...yourGroups
                    ].
                        filter((g: any) => g.representativeRelation.isGroupMember)?.
                        sort((a: any, b: any) => (
                            b.stats.members - a.stats.members ||
                            // +!!b.representativeRelation.isGroupMember - +!!a.representativeRelation.isGroupMember ||
                            +!!b.representativeRelation.isRepresentingYou - +!!a.representativeRelation.isRepresentingYou
                        ))?.
                        map((g: any, i: Number) => (
                            <GroupInList
                                key={g.name + i}
                                group={g}
                                alternativeButton={(
                                    g.representativeRelation.isGroupMember ?
                                        <div
                                            onClick={
                                                () => editUserRepresentativeGroupRelation({
                                                    variables: {
                                                        RepresenteeHandle: liquidUser?.handle,
                                                        RepresentativeHandle: representative_data?.User?.handle,
                                                        Group: g.handle,
                                                        IsRepresentingYou: !g.representativeRelation?.isRepresentingYou
                                                    }
                                                })
                                                    .then((r) => {
                                                        yourGroups_refetch();
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
                                                    `Delegate to ${representative_data?.User?.name}`
                                            }
                                        </div> :
                                        null
                                )}
                            />
                        ))}
                </div>

                {
                    !yourGroups &&
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                }

                {
                    yourGroups?.length === 0 &&
                    <div className="d-flex justify-content-center my-5">
                        You aren't in any of the same groups yet
                    </div>
                }


            </div>
        </form>
    );
}

