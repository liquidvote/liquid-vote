import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import TextInput from "@shared/Inputs/TextInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import { EDIT_NOTIFICATION_SETTINGS } from '@state/AuthUser/typeDefs';
import DropAnimation from '@components/shared/DropAnimation';
import ToggleInput from "@shared/Inputs/ToggleInput";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    allowEmails: boolean
    allowNotifications: boolean
}

export const NotificationSettings: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { liquidUser, notificationSettings, liquidUser_refetch } = useAuthUser();

    const [editNotificationSettings, {
        loading: editNotificationSettings_loading,
        error: editNotificationSettings_error,
        data: editNotificationSettings_data,
    }] = useMutation(EDIT_NOTIFICATION_SETTINGS, {
        update: cache => {
            // cache.evict({
            //     id: `authUser`,
            //     broadcast: true,
            // });
            // cache.gc();
            liquidUser_refetch();
        }
    });

    const {
        handleSubmit, register, formState: { errors }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange'
    });

    const onSubmit = async (values: any) => {
        setIsSubmitting(true);

        editNotificationSettings({
            variables: {
                notificationSettings: values
            }
        });
    }

    useEffect(() => {
        setValue('allowEmails', typeof notificationSettings?.allowEmails !== undefined ?  notificationSettings?.allowEmails : true);
        setValue('allowNotifications', typeof notificationSettings?.allowNotifications !== undefined ? notificationSettings?.allowNotifications : true);
    }, [notificationSettings]);

    useEffect(() => {
        if (!!editNotificationSettings_data) {

            updateParams({
                keysToRemove: ['modal', 'modalData'],
                paramsToAdd: { }
            });
            
        }
    }, [editNotificationSettings_data]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader
                title={`Notification Settings`}
            // hideSubmitButton={true}
            />

            {/* ON: email | app | website */}

            {!isSubmitting ? (
                <div className="Modal-Content">

                    <div className="my-3 mt-4">
                        {((name: any) => (
                            <ToggleInput
                                name={name}
                                labelName="Email Notifications"
                                register={register(name, {
                                    // validate: {
                                    //     minimum2: (v) =>
                                    //         v.reduce((acc: any, curr: any) => acc + !!curr.text, 0) >= 2 ||
                                    //         'please present at least 2 choices',
                                    // }
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                setValue={setValue}
                                info={
                                    watch(name) ? `
                                            You'll receive emails with relevant notifications
                                        ` : `
                                            You'll not receive a single email from us 😤
                                        `}
                            // disabled={modalData.questionText !== "new"}
                            />
                        ))('allowEmails')}
                    </div>

                    <div className="my-3 mt-4">
                        {((name: any) => (
                            <ToggleInput
                                name={name}
                                labelName="Push Notifications"
                                register={register(name, {
                                    // validate: {
                                    //     minimum2: (v) =>
                                    //         v.reduce((acc: any, curr: any) => acc + !!curr.text, 0) >= 2 ||
                                    //         'please present at least 2 choices',
                                    // }
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                setValue={setValue}
                                info={
                                    watch(name) ? `
                                            You'll receive relevant push notifications
                                        ` : `
                                            You'll not receive a single push notification from us 😤
                                        `}
                            // disabled={modalData.questionText !== "new"}
                            />
                        ))('allowNotifications')}
                    </div>

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

