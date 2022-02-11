import React, { FunctionComponent } from 'react';
import AgreementMeter from './AgreementMeter';

import './style.sass';

export const Avatar: FunctionComponent<{
    person?: any, type?: 'profile' | 'small'
}> = ({
    person, type ='small'
}) => {
    return (
        <div className='position-relative'>
            <div
                className={`${type}-avatar bg`}
                style={{ background: person?.avatar && `url(${person?.avatar}) 50% 50% / cover no-repeat` }}
            />
            <AgreementMeter type={type} person={person} />
        </div>
    );
}

