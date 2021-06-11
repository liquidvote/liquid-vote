import React, { FunctionComponent, useState } from 'react';
import useOnClickOutside from 'use-onclickoutside';

import './style.sass';

export const Popper: FunctionComponent<{
    button: any, popperContent: any
}> = ({
    button, popperContent
}) => {
        const [isVisible, setIsvisible] = useState(false);

        const ref = React.useRef(null);
        useOnClickOutside(ref, () => setIsvisible(false));


        return (
            <div className="position-relative">
                <div className="pointer" onClick={() => setIsvisible(!isVisible)}>
                    {button}
                </div>
                <div
                    ref={ref}
                    className={`popper-content-wrapper ${isVisible && 'is-visible'}`}
                    onClick={() => setTimeout(() => setIsvisible(false))}
                >
                    {popperContent}
                </div>
            </div>
        );
    }

