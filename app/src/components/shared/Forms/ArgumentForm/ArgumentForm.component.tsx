import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { Link, useParams } from "react-router-dom";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import useSearchParams from "@state/Global/useSearchParams.effect";
import DropDownInput from "@shared/Inputs/DropDownInput";
import GroupChannelPicker from "@shared/Inputs/GroupChannelPicker";
import MultiChoices from "@shared/Inputs/MultiChoices";
import { ARGUMENT, EDIT_ARGUMENT } from "@state/Argument/typeDefs";
import ArgumentInput from "@shared/Inputs/ArgumentInput";
import useAuthUser from '@state/AuthUser/authUser.effect';

import './style.sass';

interface IFormValues {
    argumentText: string
}

export const ArgumentForm: FunctionComponent<{}> = ({ }) => {

    let { voteName, groupHandle } = useParams<any>();
    const { liquidUser } = useAuthUser();

    const {
        loading: argument_loading,
        error: argument_error,
        data: argument_data,
        refetch: argument_refetch
    } = useQuery(ARGUMENT, {
        variables: {
            questionText: voteName,
            groupHandle,
            userHandle: liquidUser?.handle,
        },
        skip: !liquidUser
    });

    const [editArgument, {
        loading: editArgument_loading,
        error: editArgument_error,
        data: editArgument_data,
    }] = useMutation(EDIT_ARGUMENT);

    const {
        handleSubmit, register, formState: { errors, isValid }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange',
        defaultValues: {
            argumentText: ''
        }
    });

    const onSubmit = (values: any) => {
        console.log('saving!!', { values });

        editArgument({
            variables: {
                questionText: voteName,
                groupHandle,
                userHandle: liquidUser?.handle,
                ArgumentEdits: {
                    argumentText: values.argumentText
                }
            }
        });
    }

    useEffect(() => {
        if (argument_data?.Argument?.argumentText) {
            setValue('argumentText', argument_data?.Argument?.argumentText);
        };
    }, [argument_data?.Argument?.argumentText]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="argumentForm">

            <div className="d-flex">
                <div
                    className="small-avatar bg m-0"
                    style={{
                        background: liquidUser.avatar && `url(${liquidUser.avatar}) 50% 50% / cover no-repeat`
                    }}
                />

                <div className="flex-grow-1 ml-2">
                    {((name: keyof IFormValues) => (
                        <ArgumentInput
                            name={name}
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('argumentText')}
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button
                    className="button_ small"
                    type="submit"
                    disabled={
                        !watch('argumentText') ||
                        argument_data?.Argument?.argumentText === watch('argumentText')
                    }
                >
                    {argument_data?.Argument?.argumentText ?
                        'Update' :
                        'State your case'
                    }
                </button>
            </div>
        </form>
    );
}

