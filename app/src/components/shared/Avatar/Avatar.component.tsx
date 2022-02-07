import React, { FunctionComponent } from 'react';
import AgreementMeter from './AgreementMeter';

import './style.sass';

export const Avatar: FunctionComponent<{ avatarURL?: string }> = ({ avatarURL }) => {
    return (
        <>
            <div
                className="profile-avatar bg"
                style={{
                    background: avatarURL && `url(${avatarURL}) 50% 50% / cover no-repeat`
                }}
            />
            <AgreementMeter />
        </>
    );
}

