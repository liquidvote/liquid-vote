import React, { FunctionComponent, useState } from 'react';
import useOnClickOutside from 'use-onclickoutside';

import './style.sass';

export const Popper: FunctionComponent<{
    button: any, popperContent: any,
    rightOnSmall?: boolean
    startVisible?: boolean
}> = ({
    button,
    popperContent,
    rightOnSmall,
    startVisible = false
}) => {
        const [isVisible, setIsvisible] = useState(startVisible);

        const ref = React.useRef(null);
        useOnClickOutside(ref, () => setIsvisible(false));

        return (
            <div className="position-relative" ref={ref}>
                <div className="pointer" onClick={() => setIsvisible(!isVisible)}>
                    {button}
                </div>
                <div
                    className={`popper-content-wrapper ${isVisible && 'is-visible'} ${rightOnSmall && 'rightOnSmall'}`}
                    onClick={() => setTimeout(() => setIsvisible(false), 200)}
                >
                    {popperContent}
                </div>
            </div>
        );
    }

