import React, { FunctionComponent } from 'react';
import { useNavigate } from "react-router-dom";

import BackArrowSVG from "@shared/Icons/BackArrow.svg";

import './style.sass';

export const Header: FunctionComponent<{
    title: string,
    noBottom?: boolean,
    backLink?: string,
    iconType?: string,
    rightElement?: any
}> = ({
    title,
    noBottom,
    backLink,
    iconType = 'none',
    rightElement
}) => {

        const navigate = useNavigate();

        const goBack = () => {
            if (backLink) {
                navigate(backLink);
            } else {
                navigate(-1, { replace: true })
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
                {/* <div className="ml-auto">
                    {((iconType: string) => ({
                        'group': (<GroupSvg />),
                        'profile': (<ProfileSVG />),
                        'question': (<DropSVG />),
                        'none': null
                    })[iconType])(iconType)}
                </div> */}
                {!!rightElement && (
                    <div className="ml-auto">
                        {rightElement()}
                    </div>
                )}
            </div>
        );
    }

