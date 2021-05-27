import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from 'react-textarea-autosize';
import { useParams, Link } from 'react-router-dom';

import BackArrowSVG from "@shared/Icons/BackArrow.svg";
import Header from "@shared/Header";
import VoteGraph1 from "@shared/VoteGraph1";
import GroupSVG from "@shared/Icons/Group.svg";
import WorldSVG from "@shared/Icons/World.svg";
import WorldlockSVG from "@shared/Icons/Worldlock.svg";
import DropSVG from "@shared/Icons/Drop.svg";
import MultiDropSVG from "@shared/Icons/MultiDrop.svg";

import "./style.sass";

const startTextOptions = [
    "approve",
    "believe",
    "like",
    "want"
];

export const CreateVote: FunctionComponent<{ group: string }> = ({ group }) => {

    let { voteName } = useParams<any>();

    const { handleSubmit, register, setValue, watch } = useForm({
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            startText: startTextOptions[0],
            voteText: ""
        }
    });
    const onSubmit = (values: any) => alert(JSON.stringify(values, null, 2));

    // const values = getValues();
    const watchAllFields = watch();

    const setNextStartText = () => {
        const index = startTextOptions.indexOf(watchAllFields.startText);
        const optionsLength = startTextOptions.length;

        setValue(
            "startText",
            startTextOptions[optionsLength === index + 1 ? 0 : index + 1]
        );
    };

    return (
        <>
            {/* <Header title="Launch Opinion Poll" /> */}
            <form className="voteForm p-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex justify-content-around m-3 mb-4 mx-5 px-5">
                    <div className="button_ selected inverted">
                        <DropSVG />{' '}
                        Single Choice
                    </div>
                    <div className="button_">
                        <MultiDropSVG />{' '}
                        Multiple Choices
                    </div>
                </div>
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
                <TextareaAutosize
                    autoFocus
                    name="voteText"
                    value={watchAllFields.voteText.length ? watchAllFields.voteText + "?" : ''} //+ "?"
                    placeholder="Ask a question..."
                    onSelect={(e) => {
                        // move cursor to before "?"
                        if (e.target.value.length === e.target.selectionStart) {
                            e.target.selectionStart = e.target.value.length - 1;
                            e.target.selectionEnd = e.target.value.length - 1;
                        }
                    }}
                    onChange={(e) => {
                        // remove "?" from value
                        setValue(
                            "voteText",
                            e.target.value.replaceAll('?', '')
                        );
                    }}
                />

                {/* <div className="bar-wrapper py-2 pb-4">
                    <VoteGraph1 {...{
                        name: null,
                        flexSize: 1,
                        forCount: 0,
                        againstCount: 0,
                        userVote: null,
                        userDelegatedVotes: null
                    }} />
                </div> */}

                <div className="d-flex justify-content-between mt-4">
                    <div className="d-flex align-items-center cursor flex-wrap">
                        <GroupSVG />
                        <Link to="/group/Algarve Flats" className="badge ml-1 mb-1 mt-1">Algarve Flats</Link>
                        {/* <div className="badge inverted ml-1 mb-1 mt-1" role="button">+4</div> */}
                        <div onClick={() => { }} className="button_ small mb-0">
                            poll in another group
                        </div>
                        {!!watchAllFields.voteText.length && (
                            <small role="button">
                                Poll was made in 5 other groups already
                            </small>
                        )}
                    </div>

                    <div>
                        <button
                            className="button_"
                            type="submit"
                            disabled={!watchAllFields.voteText.length}
                        >Launch Poll</button>
                    </div>
                </div>

                {/* <pre>{JSON.stringify(watchAllFields, null, 2)}</pre> */}
            </form>
        </>
    );
}
