import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from "react-hook-form";
import ReactTooltip from 'react-tooltip';
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import ButtonPicker from "@shared/Inputs/ButtonPicker";
import useSearchParams from "@state/Global/useSearchParams.effect";
import DropDownInput from "@shared/Inputs/DropDownInput";
import GroupChannelPicker from "@shared/Inputs/GroupChannelPicker";
import MultiChoices from "@shared/Inputs/MultiChoices";
import { EDIT_VOTE } from "@state/Vote/typeDefs";

import './style.sass';

interface IFormValues {
    argument: string
}

export const ArgumentForm: FunctionComponent<{}> = ({ }) => {

    const history = useHistory();

    const { allSearchParams, updateParams } = useSearchParams();

    const [editVote, {
        loading: editVote_loading,
        error: editVote_error,
        data: editVote_data,
    }] = useMutation(EDIT_VOTE);

    useEffect(() => {
        if (!!editVote_data?.editVote) {

            const savedVote = editVote_data?.editVote;

            console.log({
                savedVote
            });
        }
    }, [editVote_data]);


    const {
        handleSubmit, register, formState: { errors, isValid }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange',
        defaultValues: {
            argument: ''
        }
    });

    const watchAllFields = watch();

    const onSubmit = (values: any) => {
        console.log('saving!!', { values });

        // editVote({
        //     variables: {
        //         questionText: modalData.questionHandle,
        //         group: modalData.groupHandle || '',
        //         channel: modalData.channelHandle || '',
        //         Question: {
        //             ...values,
        //             questionText: values.questionText.replaceAll('?', '')
        //         }
        //     }
        // });
    }

    // useEffect(() => {
    //     ReactTooltip.rebuild();
    // }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="argumentForm">
            Hey!
        </form>
    );
}

