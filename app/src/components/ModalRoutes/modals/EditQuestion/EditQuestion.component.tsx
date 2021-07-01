import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import TextareaAutosize from 'react-textarea-autosize';
import { useParams, Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import useSearchParams from "@state/Global/useSearchParams.effect";
import DropDownInput from "@shared/Inputs/DropDownInput";
import GroupChannelPicker from "@shared/Inputs/GroupChannelPicker";
import MultiChoices from "@shared/Inputs/MultiChoices";
import { QUESTION, EDIT_QUESTION } from "@state/Question/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    questionType: 'single' | 'multi',
    questionText: string
    startText: string,
    choices: { text: string }[]
    resultsOn: string,
    groupChannel: {
        group: string,
        channel: string
    }
}

const startTextOptions = [
    "approve",
    "believe",
    "like",
    "want"
];

export const EditQuestion: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: modalData.questionHandle,
            group: modalData.groupHandle,
            channel: modalData.channelHandle
        },
        skip: modalData.questionHandle === "new"
    });

    const [editQuestion, {
        loading: editQuestion_loading,
        error: editQuestion_error,
        data: editQuestion_data,
    }] = useMutation(EDIT_QUESTION);

    const {
        handleSubmit, register, formState: { errors, isValid }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange',
        defaultValues: {
            questionType: 'single',
            startText: 'approve',
            choices: [
                { text: '' },
                { text: '' },
                { text: '' }
            ],
            groupChannel: {
                group: modalData.groupHandle,
                channel: undefined
            }
        }
    });

    // console.log({ isValid, errors });

    const watchAllFields = watch();

    const setNextStartText = () => {
        const index = startTextOptions.indexOf(watchAllFields.startText);
        const optionsLength = startTextOptions.length;

        setValue(
            "startText",
            startTextOptions[optionsLength === index + 1 ? 0 : index + 1]
        );
    };

    const onSubmit = (values: any) => {
        console.log('saving!!', { values });

        editQuestion({
            variables: {
                questionText: modalData.questionHandle,
                group: modalData.groupHandle || '',
                channel: modalData.channelHandle || '',
                Question: values
            }
        });
    }
    // const onSubmit = (values: any) => alert(JSON.stringify(values, null, 2));

    // useEffect(() => {
    //     if (editUser_data) {
    //         updateParams({
    //             keysToRemove: ['modal', 'modalData'],
    //             paramsToAdd: { refetch: 'user' }
    //         });
    //     }
    // }, [editUser_data])

    useEffect(() => {
        ReactTooltip.rebuild();
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="voteForm">

            <ModalHeader
                title={modalData.questionHandle === "new" ? "Launch Question" : "Edit Question"}
                submitText={modalData.questionHandle === "new" ? "Launch" : "Save"}
            />

            <div className="Modal-Content">

                <div className="mt-4">
                    {((name: keyof IFormValues) => (
                        <ButtonPicker
                            name={name}
                            register={register(name)}
                            value={watch(name)}
                            error={errors[name]}
                            setValue={setValue}
                        />
                    ))('questionType')}
                </div>

                {watch('questionType') === 'single' ? (
                    <>
                        <div className="d-flex">
                            <h2 className="mb-0 mr-1 textAndInputWrapper">
                                Do you
                            </h2>
                            <input
                                {...register("startText", {
                                    required: "Required"
                                })}
                                onClick={() => setNextStartText()}
                            />
                        </div>
                    </>
                ) : null}

                <div>
                    <TextareaAutosize
                        autoFocus
                        name="questionText"
                        ref={register('questionText', {
                            validate: {
                                single: (v: any) =>
                                    v?.length > 5 ||
                                    'please make a question',
                            }
                        })}
                        value={watchAllFields?.questionText?.length ? watchAllFields?.questionText + "?" : ''} //+ "?"
                        placeholder="Ask a question..."
                        onSelect={(e: any) => {
                            // move cursor to before "?"
                            if (e.target.value.length === e.target.selectionStart) {
                                e.target.selectionStart = e.target.value.length - 1;
                                e.target.selectionEnd = e.target.value.length - 1;
                            }
                        }}
                        onChange={(e) => {
                            // remove "?" from value
                            setValue(
                                "questionText",
                                e.target.value.replaceAll('?', ''),
                                // { shouldValidate: true }
                            );
                        }}
                    />
                    {errors?.questionText && <div className="error pl-0 mt-n2">{errors?.questionText.message}</div>}
                </div>

                {watch('questionType') === 'multi' ? (
                    ((name: any) => (
                        <MultiChoices
                            name={name}
                            label="Choices"
                            register={register(name, {
                                validate: {
                                    minimum2: (v) =>
                                        v.reduce((acc: any, curr: any) => acc + !!curr.text, 0) >= 2 ||
                                        'please present at least 2 choices',
                                }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                            setValue={setValue}
                        />
                    ))('choices')
                ) : null}

                <div className="my-3 mt-4">
                    {((name: keyof IFormValues) => (
                        <GroupChannelPicker
                            name={name}
                            label="Group Channel to poll in"
                            register={register(name, {
                                validate: {
                                    group: (v: any) => !!v.group || 'please select a group and channel',
                                    channel: (v: any) => !!v.channel || 'please select a channel',
                                }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                            setValue={setValue}
                        />
                    ))('groupChannel')}
                </div>

                <div className="my-3 mt-4">
                    {((name: keyof IFormValues) => (
                        <DropDownInput
                            name={name}
                            label="Show results"
                            register={register(name, {
                                required: true
                            })}
                            value={watch(name)}
                            error={errors[name]}
                            options={[
                                {
                                    value: 'always',
                                    label: 'Always Show'
                                }, {
                                    value: 'vote',
                                    label: 'After Voting'
                                },
                                {
                                    value: '1h',
                                    label: 'In 1 hour'
                                },
                                {
                                    value: '1d',
                                    label: 'In 1 day'
                                }
                            ]}
                        />
                    ))('resultsOn')}
                </div>

                <br />
                <br />

                <pre style={{ color: 'white' }}>
                    {JSON.stringify(watchAllFields, null, 2)}
                </pre>

            </div>
        </form>
    );
}

