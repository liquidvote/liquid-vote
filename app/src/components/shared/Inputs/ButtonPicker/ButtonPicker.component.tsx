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


            <div className="d-flex justify-content-around w-100 align-items-center px-3">
                <div
                    className={`button_ w-50 ${value === 'single' ? 'selected inverted' : ''} ${disabled && 'no-events'}`}
                    onClick={() => !disabled && setValue(
                        name,
                        'single',
                        // {
                        //     shouldValidate: false,
                        //     shouldDirty: false,
                        //     shouldTouch: false
                        // }
                    )}
                // disabled={disabled}
                >
                    <span className='pr-1'><DropSVG /></span>{' '}
                    Yay or Nay
                </div>
                <div
                    className={`button_ ml-2 w-50 ${value === 'multi' ? 'selected inverted' : ''} ${disabled && 'no-events'}`}
                    onClick={() => !disabled && setValue(
                        name,
                        'multi',
                        // {
                        //     shouldValidate: false,
                        //     shouldDirty: false,
                        //     shouldTouch: false
                        // }
                    )}
                // disabled={disabled}
                >
                    <span className='pr-2'><MultiDropSVG /></span>{' '}
                    Multiple
                </div>
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

