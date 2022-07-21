import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import TextAreaInput from "@shared/Inputs/TextAreaInput";
import ToggleInput from "@shared/Inputs/ToggleInput";
import useSearchParams from "@state/Global/useSearchParams.effect";
import DropDownInput from "@shared/Inputs/DropDownInput";
import GroupChannelPicker from "@shared/Inputs/GroupChannelPicker";
import MultiChoices from "@shared/Inputs/MultiChoices";
import { QUESTION, EDIT_QUESTION } from "@state/Question/typeDefs";
import Choice from "@shared/Choice";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    questionType: 'single' | 'multi',
    questionText: string
    description: string
    startText: string,
    choices: { text: string }[]
    allowNewChoices: boolean,
    resultsOn: string,
    groupChannel: {
        group: string,
        channel: string
    },
    visibility: string,
    tags: { name: string }[]
}

const startTextOptions = [
    "approve",
    "believe",
    "like",
    "want"
];

export const EditQuestion: FunctionComponent<{}> = ({ }) => {

    const navigate = useNavigate();

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

    // console.log({
    //     question_data
    // });

    const [editQuestion, {
        loading: editQuestion_loading,
        error: editQuestion_error,
        data: editQuestion_data,
    }] = useMutation(EDIT_QUESTION);

    useEffect(() => {
        if (!!question_data?.Question) {
            setValue('questionType', question_data?.Question?.questionType);
            setValue('questionText', question_data?.Question?.questionText);
            setValue('description', question_data?.Question?.description);
            setValue('startText', question_data?.Question?.startText);
            setValue('choices', question_data?.Question?.choices);
            setValue('allowNewChoices', question_data?.Question?.allowNewChoices);
            setValue('resultsOn', question_data?.Question?.resultsOn);
            setValue('groupChannel', question_data?.Question?.groupChannel);
            setValue('visibility', question_data?.Question?.visibility);
        }
    }, [question_data]);

    useEffect(() => {
        if (!!editQuestion_data?.editQuestion) {

            const savedQuestion = editQuestion_data?.editQuestion;

            // console.log({
            //     savedQuestion
            // });

            if (savedQuestion.questionType === 'single') {
                navigate(`/poll/${encodeURIComponent(savedQuestion.questionText)}/${savedQuestion.groupChannel.group}`);
            } else {
                navigate(`/multipoll/${encodeURIComponent(savedQuestion.questionText)}/${savedQuestion.groupChannel.group}`);
            }
        }
    }, [editQuestion_data]);


    const {
        handleSubmit, register, formState: { errors, isValid }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onSubmit',
        defaultValues: {
            questionType: 'single',
            startText: 'approve',
            choices: [
                { text: '' },
                { text: '' },
                { text: '' }
            ],
            allowNewChoices: false,
            groupChannel: {
                group: modalData.groupHandle,
                channel: undefined
            },
            visibility: 'live'
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
                            disabled={modalData.questionText !== "new"}
                        />
                    ))('questionType')}
                </div>
                {/* 
                {watch('questionType') === 'single' ? (
                    <>
                        <div className="d-flex input-override position-relative on-top">
                            <h2 className="mb-0 mr-1 textAndInputWrapper">
                                Do you
                            </h2>

                            <input
                                className={`${modalData.questionText === "new" && 'pointer'}`}
                                {...register("startText", {
                                    // required: "Required"
                                })}
                                onClick={() => modalData.questionText === "new" && setNextStartText()}
                                disabled={modalData.questionText !== "new"}
                            />
                        </div>
                    </>
                ) : null} */}

                <div>
                    <div className="questionMarkInputWrapper mt-n4 mx-n2 input-override">
                        {((name: keyof IFormValues) => (
                            <TextAreaInput
                                name={name}
                                noLabel={true}
                                placeholder="Ask a question..."
                                register={register(name, {
                                    // required: true,
                                    validate: {
                                        minLength: v => v?.length > 5 || 'we need at least 5 characters here',
                                        tooBig: v => v?.length < 80 || 'should be smaller than 80 characters',
                                        // noSpecialCharacters: v => /^[_A-z0-9]*((-|\s|%|\?)*[_A-z0-9])*$/.test(v) || 'no special characters'
                                    }
                                })}
                                value={watch(name)}
                                error={errors[name]}
                                disabled={modalData.questionText !== "new"}
                            />
                        ))('questionText')}
                    </div>
                    {/* {errors?.questionText && <div className="error pl-0 mt-n2">{errors?.questionText.message}</div>} */}
                </div>

                {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}

                {watch('questionType') === 'single' ? (
                    <div className='faded no-events'>
                        <Choice
                            voteName={'l.questionText'}
                            groupHandle={null}
                            stats={null}
                            yourVote={null}
                            userVote={null}
                            user={null}
                            inList={true}
                            showChart={true}
                            yourStats={null}
                        />
                    </div>
                ) : null}

                <div className="my-3">
                    {((name: keyof IFormValues) => (
                        <TextAreaInput
                            name={name}
                            register={register(name, {
                                required: false
                            })}
                            value={watch(name)}
                            error={errors[name]}
                        />
                    ))('description')}
                </div>

                {watch('questionType') === 'multi' ? (
                    <>
                        {((name: any) => (
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
                                disabled={modalData.questionText !== "new"}
                            />
                        ))('choices')}
                        <div className="my-3 mt-4">
                            {((name: any) => (
                                <ToggleInput
                                    name={name}
                                    labelName="Allow creating new choices"
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
                                        watch('allowNewChoices') ? `
                                            Group members may add more choices
                                        ` : `
                                            No one can add more choices
                                        `}
                                // disabled={modalData.questionText !== "new"}
                                />
                            ))('allowNewChoices')}
                        </div>
                        <div className="my-3 mt-4">
                            {((name: any) => (
                                <ToggleInput
                                    name={name}
                                    labelName="Only allow voting for one choice"
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
                                        watch('allowMultipleVotes') ? `
                                            Voters can only vote on one choice - (🏗 soon)
                                        ` : `
                                            Voters can vote on all choices
                                        `}
                                // disabled={modalData.questionText !== "new"}
                                />
                            ))('allowMultipleVotes')}
                        </div>

                    </>
                ) : null}

                <div className="my-4">
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
                            disabled={modalData.questionText !== "new"}
                        />
                    ))('groupChannel')}
                </div>

                {/* <div className="my-4">
                    {((name: keyof IFormValues) => (
                        <TagsPicker
                            name={name}
                            label="Relevant tags"
                            register={register(name, {
                                // validate: {
                                //     group: (v: any) => typeof v.group !== 'undefined' || 'please select a group and channel',
                                //     // channel: (v: any) => typeof v.channel !=='undefined' || 'please select a channel',
                                // }
                            })}
                            value={watch(name)}
                            error={errors[name]}
                            setValue={setValue}
                            disabled={modalData.questionText !== "new"}
                        />
                    ))('tags')}
                </div> */}

                {/* <div className="my-3 mt-4">
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
                </div> */}

                {/* <div className="my-4">
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
                                    value: 'hidden',
                                    label: 'Hidden',
                                    info: 'Only you can see this'
                                }, {
                                    value: 'live',
                                    label: 'Live'
                                }
                            ]}
                        />
                    ))('visibility')}
                </div> */}


                <br />
                {/* <br />

                <pre style={{ color: 'white' }}>
                    {JSON.stringify(watchAllFields, null, 2)}
                </pre> */}

            </div>
        </form>
    );
}

