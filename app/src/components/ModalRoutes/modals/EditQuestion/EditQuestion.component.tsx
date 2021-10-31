import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import TextAreaInput from "@shared/Inputs/TextAreaInput";
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
    description:  string
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

    const history = useHistory();

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const {
        loading: question_loading,
        error: question_error,
        data: question_data,
        refetch: question_refetch
    } = useQuery(QUESTION, {
        variables: {
            questionText: modalData.questionText,
            group: modalData.groupHandle,
            // channel: modalData.channelHandle
        },
        skip: modalData.questionText === "new"
    });

    const [editQuestion, {
        loading: editQuestion_loading,
        error: editQuestion_error,
        data: editQuestion_data,
    }] = useMutation(EDIT_QUESTION);

    useEffect(() => {
        if (!!editQuestion_data?.editQuestion) {

            const savedQuestion = editQuestion_data?.editQuestion;

            console.log({
                savedQuestion
            });

            if (savedQuestion.questionType === 'single') {
                history.push(`/poll/${savedQuestion.questionText}/${savedQuestion.groupChannel.group}`);
            } else {
                history.push(`/multipoll/${savedQuestion.questionText}/${savedQuestion.groupChannel.group}`);
            }
        }
    }, [editQuestion_data]);


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
                questionText: modalData.questionText,
                group: modalData.groupHandle || '',
                channel: modalData.channelHandle || '',
                Question: {
                    ...values,
                    questionText: values.questionText.replaceAll('?', '')
                }
            }
        });
    }

    useEffect(() => {
        ReactTooltip.rebuild();
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="voteForm">

            <ModalHeader
                title={modalData.questionText === "new" ? "Launch Poll" : "Edit Poll"}
                submitText={modalData.questionText === "new" ? "Launch" : "Save"}
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
                        <div className="d-flex input-override">
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
                    <div className="questionMarkInputWrapper mt-n4 mx-n2 input-override">
                        {((name: keyof IFormValues) => (
                            <TextAreaInput
                                name={name}
                                noLabel={true}
                                placeholder="Ask a question..."
                                register={register(name, {
                                    required: true
                                })}
                                value={watch(name)}
                                error={errors[name]}
                            />
                        ))('questionText')}
                    </div>
                    {errors?.questionText && <div className="error pl-0 mt-n2">{errors?.questionText.message}</div>}
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
                    ))('description')}
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
                            label="Group to Poll in"
                            register={register(name, {
                                validate: {
                                    group: (v: any) => typeof v.group !== 'undefined' || 'please select a group and channel',
                                    // channel: (v: any) => typeof v.channel !=='undefined' || 'please select a channel',
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
                            label="Show results 🧪"
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
                {/* <br />

                <pre style={{ color: 'white' }}>
                    {JSON.stringify(watchAllFields, null, 2)}
                </pre> */}

            </div>
        </form>
    );
}

