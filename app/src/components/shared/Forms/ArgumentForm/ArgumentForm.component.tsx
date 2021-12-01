import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import useSearchParams from "@state/Global/useSearchParams.effect";
import DropDownInput from "@shared/Inputs/DropDownInput";
import GroupChannelPicker from "@shared/Inputs/GroupChannelPicker";
import MultiChoices from "@shared/Inputs/MultiChoices";
import { ARGUMENT, EDIT_ARGUMENT } from "@state/Argument/typeDefs";
import ArgumentInput from "@shared/Inputs/ArgumentInput";
import useAuthUser from '@state/AuthUser/authUser.effect';
import { EDIT_ARGUMENT_UP_VOTE } from "@state/ArgumentUpVotes/typeDefs";
import LikeSVG from '@components/shared/Icons/Like.svg';
import LikedSVG from '@components/shared/Icons/Liked.svg';
import { timeAgo } from '@state/TimeAgo';

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

    const [editArgumentUpVote, {
        loading: editArgumentUpVote_loading,
        error: editArgumentUpVote_error,
        data: editArgumentUpVote_data,
    }] = useMutation(EDIT_ARGUMENT_UP_VOTE);

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
        }).then(() => {
            argument_refetch();
        });
    }

    useEffect(() => {
        if (argument_data?.Argument?.argumentText) {
            setValue('argumentText', argument_data?.Argument?.argumentText);
        };
    }, [argument_data?.Argument?.argumentText]);

    const voted = !!editArgumentUpVote_data ? editArgumentUpVote_data?.editArgumentUpVote?.voted : argument_data?.Argument?.yourUpVote;
    const count = !!editArgumentUpVote_data ? editArgumentUpVote_data?.editArgumentUpVote.argument?.stats?.votes : argument_data?.Argument?.stats?.votes;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="argumentForm">

            <div className="d-flex">
                <div
                    className="small-avatar bg m-0"
                    style={{
                        background: liquidUser.avatar && `url(${liquidUser.avatar}) 50% 50% / cover no-repeat`
                    }}
                />

                <div className="flex-grow-1 ml-3">
                    <div className="mb-n1 flex-fill d-flex align-items-center justify-content-between">
                        <div className="w-75">
                            <div className="d-block">
                                <b className="mr-1">{liquidUser?.name}</b>
                            </div>
                        </div>
                        {!!argument_data?.Argument?.lastEditOn && (
                            <div className="d-flex flex-column justify-content-end mw-25" style={{ flex: 1 }}>
                                <small className="text-right" data-tip="Voted on">
                                    {timeAgo.format(new Date(Number(argument_data?.Argument?.lastEditOn)))}
                                </small>
                            </div>
                        )}
                    </div>
                    <div className="">
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
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            {argument_data?.Argument?.argumentText && (
                                <div className="d-flex align-items-center">
                                    <div className="pointer mr-1" onClick={() => editArgumentUpVote({
                                        variables: {
                                            questionText: argument_data?.Argument.question.questionText,
                                            groupHandle: argument_data?.Argument.group.handle,
                                            userHandle: liquidUser?.handle,
                                            voted: !voted
                                        }
                                    })}>{!!voted ? <LikedSVG /> : <LikeSVG />}</div>
                                    <div>{count > 0 ? count : ''}</div>
                                    {editArgumentUpVote_loading && (
                                        <img
                                            className="vote-avatar ml-1"
                                            src={'http://images.liquid-vote.com/system/loading.gif'}
                                            alt={'loading'}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            {editArgument_loading && (
                                <img
                                    className="vote-avatar ml-1"
                                    src={'http://images.liquid-vote.com/system/loading.gif'}
                                    alt={'loading'}
                                />
                            )}
                            <button
                                className="button_ small ml-1"
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
                    </div>
                </div>
            </div>

            {/* <div className="d-flex justify-content-end">
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
            </div> */}
        </form>
    );
}

