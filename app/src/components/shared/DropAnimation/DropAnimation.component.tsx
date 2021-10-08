import React, { FunctionComponent } from 'react';

import './style.sass';

export const DropAnimation: FunctionComponent<{}> = ({ }) => {
    return (
        <div className="drop-wrapper">
            <div>
                <div className="ripple-wrapper">
                    <div className="wave_1 outer-shadow"></div>
                    <div className="wave_2 outer-shadow align-center"></div>
                    <div className="wave_3 outer-shadow align-center"></div>
                    <div className="drop align-center"></div>
                </div>
            </div>
        </div>
    );
}

