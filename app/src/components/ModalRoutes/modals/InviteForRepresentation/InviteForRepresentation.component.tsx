import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import GroupInList from "@shared/GroupInList";
import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, EDIT_USER } from "@state/User/typeDefs";
import { USER_GROUPS } from "@state/User/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    groups: [string]
}

export const InviteForRepresentation: FunctionComponent<{}> = ({ }) => {

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
        variables: { handle: authUser_data?.authUser?.LiquidUser?.handle },
        skip: !authUser_data?.authUser
    });

    const {
        loading: user_loading,
        error: user_error,
        data: user_data,
        refetch: user_refetch
    } = useQuery(USER, {
        variables: { handle: modalData.userHandle },
        skip: modalData.userHandle === "new"
    });

    const [editUser, {
        loading: editUser_loading,
        error: editUser_error,
        data: editUser_data,
    }] = useMutation(EDIT_USER);

    useEffect(() => {
        console.log({
            user_data,
            modalData
        })
        // setValue('name', user_data.User.name);
        // setValue('location', user_data.User.location);
        // setValue('bio', user_data.User.bio);
        // setValue('externalLink', user_data.User.externalLink);
        // setValue('avatar', user_data.User.avatar);
        // setValue('cover', user_data.User.cover);
        // setValue('email', user_data.User.email);
    }, [user_data]);

    useEffect(() => {
        if (editUser_data) {
            updateParams({
                keysToRemove: ['modal', 'modalData'],
                paramsToAdd: { refetch: 'user' }
            });
        }
    }, [editUser_data])

    return (
        <form>

            <ModalHeader title={`Invite others to be represented by you`} />

            <div className="Modal-Content">

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <p>Groups Selector: TODO</p>
                        // <TextInput
                        //     name={name}
                        //     register={register(name, {
                        //         required: true,
                        //         validate: {
                        //             tooBig: v => v.length < 15 || 'should be smaller than 15 characters',
                        //         }
                        //     })}
                        //     value={watch(name)}
                        //     error={errors[name]}
                        // />
                    ))('groups')}
                </div>

                <div>
                    {yourGroups_data?.UserGroups?.map((el: any, i: Number) => (
                        <GroupInList
                            key={el.name + i}
                            group={el}
                        />
                    ))}
                </div>

                <hr />

                <br />
                <br />

            </div>
        </form>
    );
}

