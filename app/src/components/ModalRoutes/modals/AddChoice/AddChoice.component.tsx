import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import { QUESTION, ADD_CHOICE } from "@state/Question/typeDefs";
import TextInput from "@shared/Inputs/TextInput";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    newChoice: any[]
}

export const AddChoice: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = allSearchParams.modalData && JSON.parse(allSearchParams.modalData);
    const { liquidUser } = useAuthUser();

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: modalData.questionText,
            group: modalData.group,
            // channel: modalData.channelHandle
        },
        skip: modalData.questionText === "new"
    });

    const [addChoice, {
        loading: addChoice_loading,
        error: addChoice_error,
        data: addChoice_data,
    }] = useMutation(ADD_CHOICE, {
        update: cache => {
            cache.evict({
                id: `Question:${question_data?.Question?._id}`,
                broadcast: true,
            });
            cache.gc();

            updateParams({ keysToRemove: ['modal', 'modalData'] });
        }
    });

    const {
        handleSubmit, register, formState: { errors, isValid }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onSubmit'
    });

    const onSubmit = async (values: any) => {
        console.log({
            values
        });

        addChoice({
            variables: {
                questionText: modalData.questionText,
                group: modalData.group,
                newChoice: values?.newChoice
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader
                title={`Add a choice to ${modalData.questionText}`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <div className="my-3 mt-4">
                    {((name: keyof IFormValues) => (
                        <TextInput
                            name={name}
                            labelName="New Choice"
                            register={register(name, {
                                // required: true,
                                validate: {
                                    tooSmall: v => v.length > 3 || 'should be longer than 3 characters',
                                    tooBig: v => v.length < 35 || 'should be smaller than 35 characters',
                                }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('newChoice')}
                </div>


                <div className="d-flex flex-column align-items-center my-3 mb-5 mx-5">
                    <button
                        className="button_ inverted mb-2 w-100"
                    >
                        Add
                    </button>
                    <div
                        className="button_ w-100"
                        onClick={() => updateParams({ keysToRemove: ['modal', 'modalData'] })}
                    >
                        Cancel
                    </div>
                </div>
            </div>
        </form>
    );
}

