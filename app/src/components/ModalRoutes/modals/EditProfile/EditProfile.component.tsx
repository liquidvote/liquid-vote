import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, EDIT_USER } from "@state/User/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    name: string
    location: string
    handle: string
    avatar: string
    cover: string
    bio: string
    externalLink: string
    email: string
}

export const EditProfile: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

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

    const {
        handleSubmit, register, formState: { errors }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange'
    });
    const onSubmit = (values: any) => {
        console.log(values);

        editUser({ variables: { User: values } });
    }

    useEffect(() => {
        console.log({
            user_data,
            modalData
        })
        setValue('name', user_data.User.name);
        setValue('location', user_data.User.location);
        setValue('bio', user_data.User.bio);
        setValue('externalLink', user_data.User.externalLink);
        setValue('avatar', user_data.User.avatar);
        setValue('cover', user_data.User.cover);
        setValue('email', user_data.User.email);
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
        <form onSubmit={handleSubmit(onSubmit)}>

            <ModalHeader title="Edit Profile" />

            <div className="Modal-Content">

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: true,
                                validate: {
                                    tooBig: v => v.length < 15 || 'should be smaller than 15 characters',
                                }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('name')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('location')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('bio')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                // required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('externalLink')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('avatar')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('cover')}
                </div>

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            register={register(name, {
                                required: "Required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "invalid email address"
                                }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('email')}
                </div>

                <br />
                <br />

            </div>
        </form>
    );
}

