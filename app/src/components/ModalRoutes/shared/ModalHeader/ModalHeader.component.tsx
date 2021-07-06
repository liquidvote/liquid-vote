import React, { FunctionComponent } from 'react';

import XSVG from "@shared/Icons/X.svg";
import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

export const ModalHeader: FunctionComponent<{
    title: string,
    submitText?: string,
    hideSubmitButton?: boolean
}> = ({
    title,
    submitText,
    hideSubmitButton
}) => {

        const { allSearchParams, updateParams } = useSearchParams();

        return (

            <div className="Modal-Header">
                <div className="d-flex justify-content-between mb-n2">
                    <div className="d-flex align-items-center">
                        <div
                            onClick={() => updateParams({ keysToRemove: ['modal', 'modalData'] })}
                            role="button"
                        >
                            <XSVG />
                        </div>
                        <h4 className="ml-4 my-n2">{title}</h4>
                    </div>
                    {!hideSubmitButton && (
                        <button className={'button_ inverted'} type="submit">{submitText || 'Save'}</button>
                    )}
                </div>
                <hr className="mb-0" />
            </div>
        );
    }

