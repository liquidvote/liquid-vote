import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';

import DropSVG from "@shared/Icons/Drop.svg";
import MultiDropSVG from "@shared/Icons/MultiDrop.svg";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    name: string,
    value: any,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any
}

export const ButtonPicker: FunctionComponent<Props> = ({
    register, name, value, error, disabled, autoFocus, setValue
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            {/* <label>
                {name}
            </label> */}


            <div className="d-flex justify-content-around m-3 mx-5 px-5">
                <button
                    className={`button_ ${value === 'single' ? 'selected inverted' : ''} ${disabled && 'no-events'}`}
                    onClick={() => !disabled && setValue(
                        name,
                        'single',
                        { shouldValidate: true }
                    )}
                    // disabled={disabled}
                >
                    <DropSVG />{' '}
                    For or Against
                </button>
                <button
                    className={`button_ ml-2 ${value === 'multi' ? 'selected inverted' : ''} ${disabled && 'no-events'}`}
                    onClick={() => !disabled && setValue(
                        name,
                        'multi',
                        { shouldValidate: true }
                    )}
                    // disabled={disabled}
                >
                    <MultiDropSVG />{' '}
                    Multiple Choices
                </button>
            </div>

            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">
                <input
                    className="d-none"
                    {...register}
                    name={name}
                    type={'input'}
                    disabled={disabled}
                    // autoFocus={autoFocus || false}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                />
            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
}

