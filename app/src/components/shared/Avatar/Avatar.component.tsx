import React, { FunctionComponent } from 'react';
import AgreementMeter from './AgreementMeter';

import useUser from '@state/User/user.effect';

import './style.sass';

export const Avatar: FunctionComponent<{
    person?: any, type?: 'profile' | 'small' | 'vote' | 'tiny', groupHandle?: string
}> = ({
    person, type = 'small', groupHandle
}) => {

        const { user } = useUser({ userHandle: person.handle, groupHandle });

        return (
            <div className='position-relative'>
                <div
                    className={`${type}-avatar bg`}
                    style={{ background: (person?.avatar || user?.avatar) && `url(${user?.avatar || person?.avatar}) 50% 50% / cover no-repeat` }}
                />
                <AgreementMeter
                    inner
                    type={type}
                    yourStats={(user || person)?.yourStats}
                    personStats={(user || person)?.stats}
                />
                {groupHandle ? (
                    <AgreementMeter
                        type={type}
                        yourStats={(user || person)?.groupStats?.yourStats}
                        personStats={(user || person)?.groupStats?.stats}
                    />
                ) : null}
                {/* <AgreementMeter inner type={type} person={user || person} /> */}
            </div>
        );
    }

