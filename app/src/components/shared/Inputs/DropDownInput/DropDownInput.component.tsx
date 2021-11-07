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
    label?: string,
    name: string,
    value: string,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    options: { value: string, label: string, info?: string }[]
}

export const DropDownInput: FunctionComponent<Props> = ({
    register,
    label,
    name,
    value,
    type = 'input',
    error,
    disabled,
    autoFocus,
    options
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {label || name}
            </label>
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper position-relative">

                <select
                    {...register}
                    name={name}
                    className="select"
                    // onChange={(e) => setValue(e.target.value)}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                >
                    {options.map(o => (
                        <option
                            value={o.value}
                            key={o.value}
                        >{o.label}</option>
                    ))}
                    <option value='' disabled>--</option>
                </select>

                <div className="choice-info">
                    <small>
                        {options?.find(o => o.value ===value)?.info}
                    </small>
                </div>

            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};
