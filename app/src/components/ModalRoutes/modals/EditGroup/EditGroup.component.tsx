import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import TextInput from "@shared/Inputs/TextInput";
import ImageInput from "@shared/Inputs/ImageInput";
import TextAreaInput from "@shared/Inputs/TextAreaInput";
import DropDownInput from "@shared/Inputs/DropDownInput";
import AdminsInput from "@shared/Inputs/AdminsInput";
import ChannelsInput from "@shared/Inputs/ChannelsInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import { GROUP, EDIT_GROUP } from "@state/Group/typeDefs";
import { AUTH_USER } from "@state/AuthUser/typeDefs";
import useFileUploader from "@state/S3/useFileUploader.effect";
import DropAnimation from '@components/shared/DropAnimation';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    name: string
    handle: string
    // avatar: string
    cover: string | File
    bio: string
    externalLink: string,
    channels: any,
    admins: any
    privacy: string
}

export const EditGroup: FunctionComponent<{}> = ({ }) => {

    const history = useHistory();
    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);
    const { uploadFile } = useFileUploader();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        loading: authUser_loading,
        error: authUser_error,
        data: authUser_data,
        refetch: authUser_refetch
    } = useQuery(AUTH_USER);

    const authUser = authUser_data?.authUser;

    const {
        loading: group_loading,
        error: group_error,
        data: group_data,
        refetch: group_refetch
    } = useQuery(GROUP, {
        variables: { handle: modalData.groupHandle },
        skip: modalData.groupHandle === "new"
    });

    const [editGroup, {
        loading: editGroup_loading,
        error: editGroup_error,
        data: editGroup_data,
    }] = useMutation(EDIT_GROUP);

    const {
        handleSubmit, register, formState: { errors }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange'
    });
    const onSubmit = async (values: any) => {
        setIsSubmitting(true);

        editGroup({
            variables: {
                Group: {
                    ...values,
                    // avatar: !!values.avatar && typeof values.avatar === 'string' ? values.avatar : await uploadFile({ file: values.avatar }),
                    cover: !!values.cover && typeof values.cover === 'string' ? values.cover : await uploadFile({ file: values.cover })

                },
                handle: modalData.groupHandle
            }
        });
    }

    useEffect(() => {
        setValue('handle', group_data?.Group.handle);
        setValue('name', group_data?.Group.name);
        setValue('bio', group_data?.Group.bio);
        setValue('externalLink', group_data?.Group.externalLink);
        // setValue('avatar', group_data?.Group.avatar);
        setValue('cover', group_data?.Group.cover);
        setValue('channels', group_data?.Group.channels || ['general']);
        setValue('admins', group_data?.Group.admins || [{
            handle: authUser?.LiquidUser?.handle,
            name: authUser?.LiquidUser?.name,
            avatar: authUser?.LiquidUser?.avatar,
        }]);
        setValue('privacy', group_data?.Group.privacy);
    }, [group_data]);

    useEffect(() => {
        if (!!editGroup_data?.editGroup) {

            if (modalData.groupHandle === "new") {
                // console.log("push!!", { g: editGroup_data?.editGroup });
                history.push(`/group/${editGroup_data?.editGroup?.handle}`);
            } else {
                updateParams({
                    keysToRemove: ['modal', 'modalData'],
                    paramsToAdd: { refetch: 'group' }
                });
            }
        }
    }, [editGroup_data])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <ModalHeader title={modalData.groupHandle === "new" ? "Create Group" : "Edit Group"} />

            {!isSubmitting ? (
                <div className="Modal-Content">

                    {modalData.groupHandle === "new" && (
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
                            ))('handle')}
                        </div>
                    )}

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
                        ))('cover')}
                    </div>

                    <div className="my-3">
                        {((name: keyof IFormValues) => (
                            <AdminsInput
                                name={name}
                                register={register(name, {
                                    required: true
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                setValue={setValue}
                            />
                        ))('admins')}
                    </div>

                    {/* <div className="my-3">
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
                </div> */}

                    <div className="my-3">
                        {((name: keyof IFormValues) => (
                            <DropDownInput
                                name={name}
                                register={register(name, {
                                    required: true
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                options={[
                                    {
                                        value: 'private',
                                        label: 'Private'
                                    }, {
                                        value: 'public',
                                        label: 'Public'
                                    }
                                ]}
                            />
                        ))('privacy')}
                    </div>

                    {/* <select {...register("privacy")}>
                    <option value="female">female</option>
                    <option value="male">male</option>
                    <option value="other">other</option>
                </select> */}

                    <br />
                    <br />

                </div>
            ) : (
                <div className="d-flex justify-content-center my-5">
                    <DropAnimation />
                </div>
            )}
        </form >
    );
}

