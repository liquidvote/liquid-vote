import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, USER_GROUPS, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const EditRepresentativeRelation: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

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
        variables: {
            handle: authUser_data?.authUser?.LiquidUser?.handle,
            representative: modalData.userHandle
        },
        skip: !authUser_data?.authUser
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
        // setValue('name', representative_data.User.name);
        // setValue('location', representative_data.User.location);
        // setValue('bio', representative_data.User.bio);
        // setValue('externalLink', representative_data.User.externalLink);
        // setValue('avatar', representative_data.User.avatar);
        // setValue('cover', representative_data.User.cover);
        // setValue('email', representative_data.User.email);
    }, [representative_data]);

    // useEffect(() => {
    //     if (editUser_data) {
    //         updateParams({
    //             keysToRemove: ['modal', 'modalData'],
    //             paramsToAdd: { refetch: 'user' }
    //         });
    //     }
    // }, [editUser_data])

    return (
        <form>

            <ModalHeader
                title={`Delegate Votes to ${modalData?.userName}`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <h4 className="mt-4">Your Groups:</h4>

                <div>
                    {yourGroups_data?.UserGroups?.map((g: any, i: Number) => (
                        <GroupInList
                            key={g.name + i}
                            group={g}
                            inviteButton={(
                                !g.representativeRelation.isGroupMember ?
                                    <div className={`button_ small mb-0 ml-1`}>
                                        Invite
                                    </div> :
                                    null
                            )}
                            alternativeButton={(
                                g.representativeRelation.isGroupMember ?
                                    <div
                                        onClick={
                                            () => editUserRepresentativeGroupRelation({
                                                variables: {
                                                    RepresenteeHandle: authUser_data?.authUser?.LiquidUser?.handle,
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

                <br />

            </div>
        </form>
    );
}

