import React, { FunctionComponent } from 'react';
import AgreementMeter from './AgreementMeter';

import './style.sass';

export const Avatar: FunctionComponent<{
    avatarURL?: string, type?: 'profile' | 'small'
}> = ({
    avatarURL, type ='small'
}) => {
    return (
        <div className='position-relative'>
            <div
                className={`${type}-avatar bg`}
                style={{ background: avatarURL && `url(${avatarURL}) 50% 50% / cover no-repeat` }}
            />
            <AgreementMeter type={type} />
        </div>
    );
}

