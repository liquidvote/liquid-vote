import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    labelName?: string,
    name: string,
    value: string,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean
}

export const ArgumentInput: FunctionComponent<Props> = ({
    register, labelName, name, value, type = 'input', error, disabled, autoFocus
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            {/* <label>
                {name}
            </label> */}

            <div className="inputElementWrapper">
                <TextareaAutosize
                    {...register}
                    name={name}
                    type={type || 'input'}
                    // disabled={disabled}
                    // autoFocus={autoFocus || false}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Would you like to make an argument?"
                    className="argument-input"
                />
            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};

