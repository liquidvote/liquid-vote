import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import TextInput from "@shared/Inputs/TextInput";
import TextAreaInput from "@shared/Inputs/TextAreaInput";
import ImageInput from "@shared/Inputs/ImageInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { USER, EDIT_USER } from "@state/User/typeDefs";
import useFileUploader from "@state/S3/useFileUploader.effect";
import DropAnimation from '@components/shared/DropAnimation';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    name: string
    location: string
    handle: string
    avatar: string | File
    cover: string | File
    bio: string
    externalLink: string
    email: string
}

export const EditProfile: FunctionComponent<{}> = ({ }) => {

    const history = useHistory();
    const { allSearchParams, updateParams } = useSearchParams();
    const { uploadFile } = useFileUploader();
    const modalData = JSON.parse(allSearchParams.modalData);

    const [isSubmitting, setIsSubmitting] = useState(false);

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
    const onSubmit = async (values: any) => {
        setIsSubmitting(true);


        const User = {
            ...values,
            avatar: typeof values.avatar === 'string' ? values.avatar : await uploadFile({ file: values.avatar }),
            cover: typeof values.cover === 'string' ? values.cover : await uploadFile({ file: values.cover })
        };

        console.log({ User });

        editUser({
            variables: {
                User
            }
        }).then((r) => {
            console.log({ r })
        });
    }

    useEffect(() => {
        setValue('name', user_data?.User?.name);
        setValue('location', user_data?.User?.location);
        setValue('bio', user_data?.User?.bio);
        setValue('externalLink', user_data?.User?.externalLink);
        setValue('avatar', user_data?.User?.avatar);
        setValue('cover', user_data?.User?.cover);
        setValue('email', user_data?.User?.email);
    }, [user_data]);

    useEffect(() => {
        if (!!editUser_data?.editUser) {
            // history.push(`/profile/${editUser_data?.editUser?.LiquidUser?.handle}`);
            updateParams({
                keysToRemove: ['modal', 'modalData'],
                paramsToAdd: { refetch: 'user' }
            });
        }
    }, [editUser_data])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <ModalHeader title="Edit Profile" />

            {!isSubmitting ? (
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
                            <TextAreaInput
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
                            <ImageInput
                                name={name}
                                register={register(name, {
                                    required: true
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                setValue={setValue}
                            />
                        ))('avatar')}
                    </div>

                    <div className="my-3">
                        {((name: keyof IFormValues) => (
                            <ImageInput
                                name={name}
                                register={register(name, {
                                    required: true
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                setValue={setValue}
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
            ) : (
                <div className="d-flex justify-content-center my-5">
                    <DropAnimation />
                </div>
            )}

        </form>
    );
}

