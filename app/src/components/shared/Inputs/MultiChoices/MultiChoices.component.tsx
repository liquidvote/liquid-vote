import React, {
    FunctionComponent,
    forwardRef,
    useState,
    useEffect
} from 'react';
import { FieldError } from 'react-hook-form';

import GroupSVG from "@shared/Icons/Group-small.svg";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    label?: string,
    name: string,
    value: { text: string }[],
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any
}

export const MultiChoices: FunctionComponent<Props> = ({
    register,
    label,
    name,
    value,
    type = 'input',
    error,
    disabled,
    autoFocus,
    setValue
}) => {

    const [isFocused, setIsFocused] = useState(false);

    const handleChoiceChange = ({ i, text }: { i: number, text: string }) => {
        setValue(
            name,
            [
                ...value?.map((c, i_) => i === i_ ? ({ text }) : c),
                ...(i === value?.length - 1) ? [{ text: '' }] : []
            ],
            { shouldValidate: true }
        );
    }

    return (
        <div className={
            `InputWrapper wrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {label || name}
            </label>


            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">

                <input
                    className="d-none"
                    {...register}
                    name={name}
                    type={'input'}
                // disabled={disabled}
                // autoFocus={autoFocus || false}
                />

                <div className="d-flex justify-content-between m-2">
                    <div className="d-flex align-items-center cursor flex-wrap mt-4 w-100">
                        {value?.map((c, i) => (
                            <input
                                key={'option' + i}
                                className="choice"
                                placeholder={`Choice ${i + 1}${i > 1 ? ' (optional)' : ''}`}
                                onBlur={() => setIsFocused(false)}
                                onFocus={() => setIsFocused(true)}
                                onChange={e => handleChoiceChange({ i, text: e.target.value })}
                                value={value[i]?.text}
                            />
                        ))}
                    </div>
                </div>

            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};
