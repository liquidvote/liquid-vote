import React, {
    FunctionComponent,
    useState
} from 'react';
import env from '@env';

import './style.sass';

type Props = {
    label?: string,
    groupHandle?: string,
    fromWhomHandle?: string,
}

export const InvitesLink: FunctionComponent<Props> = ({
    label,
    groupHandle,
    fromWhomHandle
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const link = `${env.website}/invite/by/${fromWhomHandle}/to/group/${groupHandle}`;

    return (
        <div className={
            `InputWrapper hasValue ${isFocused && 'isFocused'}`
        }>
            <label>
                {label}
            </label>

            <div className="inputElementWrapper">
                <div className="inputElementWrapper">
                    <input
                        type={'input'}
                        value={link}
                        onClick={e => (e.target as any).select()}
                        onBlur={() => setIsFocused(false)}
                        onFocus={() => setIsFocused(true)}
                    />
                </div>
            </div>
        </div>
    );
}

