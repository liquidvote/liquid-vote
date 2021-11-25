import React, { FunctionComponent, useEffect, useState } from 'react';

import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useGroup from '@state/Group/group.effect';
import {default  as ChooseRepresentatives_ } from '@components/shared/ChooseRepresentatives';

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

export const ChooseRepresentatives: FunctionComponent<{}> = ({ }) => {
    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const { liquidUser } = useAuthUser();
    const { group } = useGroup({ handle: modalData?.groupHandle });

    return (
        <form>
            <ModalHeader
                title={
                    !!group ? `Your representatives for ${group?.name}` : 'Loading'
                }
                // submitText={`Invite`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                <ChooseRepresentatives_ />

            </div>
        </form>
    );
}

