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
import useFileUploader from "@state/S3/useFileUploader.effect";
import DropAnimation from '@components/shared/DropAnimation';
import useAuthUser from '@state/AuthUser/authUser.effect';
import useGroup from '@state/Group/group.effect';

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

    const { liquidUser } = useAuthUser();
    const { group, editGroup, editedGroup } = useGroup({ handle: modalData?.groupHandle });

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
                    cover: !!values.cover && typeof values.cover === 'string' ? values.cover : await uploadFile({ file: values.cover }),
                    admins: values.admins.filter(u => !u.remove)

                },
                handle: modalData.groupHandle
            }
        });
    }

    useEffect(() => {
        setValue('handle', group?.handle);
        setValue('name', group?.name);
        setValue('bio', group?.bio || '🌱');
        setValue('externalLink', group?.externalLink);
        // setValue('avatar', group?.avatar);
        setValue('cover', group?.cover || 'http://images.liquid-vote.com/system/placeholderCover1.jpeg');
        setValue('channels', group?.channels || ['general']);
        setValue('admins', group?.admins || [{
            handle: liquidUser?.handle,
            name: liquidUser?.name,
            avatar: liquidUser?.avatar,
        }]);
        setValue('privacy', group?.privacy || 'public');
    }, [group, liquidUser]);

    useEffect(() => {
        if (!!editedGroup) {

            if (modalData.groupHandle === "new") {
                // console.log("push!!", { g: editedGroup });
                history.push(`/group/${editedGroup?.handle}`);
            } else {
                updateParams({
                    keysToRemove: ['modal', 'modalData'],
                    paramsToAdd: { refetch: 'group' }
                });
            }
        }
    }, [editedGroup])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <ModalHeader title={modalData.groupHandle === "new" ? "Create Group" : "Edit Group"} />

            {!isSubmitting ? (
                <div className="Modal-Content">

                    <div className="my-3">
                        {((name: keyof IFormValues) => (
                            <TextInput
                                name={name}
                                register={register(name, {
                                    required: true,
                                    validate: {
                                        tooBig: v => v.length < 35 || 'should be smaller than 35 characters',
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
                                    required: true,
                                    validate: {
                                        tooBig: v => v.length < 15 || 'should be smaller than 15 characters',
                                    }
                                })}
                                precedingText="@"
                                value={watch(name)}
                                error={errors[name]}
                                disabled={modalData.groupHandle !== "new"}
                            />
                        ))('handle')}
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
                                precedingText="www."
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
                                        label: 'Private',
                                        info: 'Only found by invite, hidden to non members'
                                    }, {
                                        value: 'linkonly',
                                        label: 'Link Only',
                                        info: 'Visible with direct link, but not Searchable'
                                    }, {
                                        value: 'public',
                                        label: 'Public',
                                        info: 'Searchable on Liquid Vote and Google'
                                    }
                                ]}
                            />
                        ))('privacy')}
                    </div>

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

