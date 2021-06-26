import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    name: string,
    value: any,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean
}

export const AdminsInput: FunctionComponent<Props> = ({
    register, name, value, error, disabled, autoFocus
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {name}
            </label>
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">
                <ul className="adminsInputList">
                    {value?.map((v: any, i: Number) => (
                        <li key={v.name+i} className="d-flex">
                            <div>
                                <img className="vote-avatar" src={v.avatar} />
                            </div>
                            <div className="ml-2">
                                <p className="m-0">{v.name}</p>
                                <small>@{v.handle}</small>
                            </div>
                        </li>
                    ))}
                </ul>
                <input
                    className="d-none"
                    {...register}
                    name={name}
                    type={'input'}
                    // disabled={disabled}
                    // autoFocus={autoFocus || false}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                />
            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
}

