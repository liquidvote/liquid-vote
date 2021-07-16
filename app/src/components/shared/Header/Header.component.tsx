import React, { FunctionComponent } from 'react';
import { useHistory } from "react-router-dom";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";

import './style.sass';

export const Header: FunctionComponent<{
    title: string,
    noBottom?: boolean,
    backLink?: string
}> = ({
    title,
    noBottom,
    backLink
}) => {

        const history = useHistory();

        const goBack = () => {
            if (backLink) {
                history.push(backLink);
            } else {
                history.goBack()
            }
        }

        return (
            <div className={`top ${!noBottom && 'border-bottom'}`}>
                <div onClick={goBack} role="button">
                    <BackArrowSVG />
                </div>
                <div className="top-text-container">
                    <div>{title}</div>
                </div>
            </div>
        );
    }

