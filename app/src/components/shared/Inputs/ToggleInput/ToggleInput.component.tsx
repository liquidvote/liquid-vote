import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import Switch from "react-switch";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    labelName?: string,
    name: string,
    value: boolean,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    loading?: boolean,
    setValue: any,
    info?: string
}

export const ToggleInput: FunctionComponent<Props> = ({
    register,
    labelName,
    name,
    value,
    type = 'input',
    error,
    disabled,
    autoFocus,
    loading,
    setValue,
    info
}) => {

    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (v: boolean) => {
        setValue(
            name,
            v,
            // { shouldValidate: true }
        );
    }

    return (
        <div
            className={
                `InputWrapper hasValue wrapper ${error && 'hasError'} ${isFocused && 'isFocused'}`
            }
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
        >
            <label>
                {labelName || name}
            </label>

            {(loading || error?.type === 'loading') && (
                <img
                    className="vote-avatar loading"
                    src={'http://images.liquid-vote.com/system/loading.gif'}
                    alt={'loading'}
                />
            )}
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">

                <div className="toggle-info">
                    <small>
                        {info}
                    </small>
                </div>

                <input
                    className="d-none"
                    {...register}
                    name={name}
                    type={'input'}
                    disabled={disabled}
                // autoFocus={autoFocus || false}
                />

                <div className="toggle-wrapper">
                    <Switch
                        // onChange={this.handleChange}
                        checked={value || false}
                        onChange={handleChange}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor="#11AFAD"
                        offColor="#0A2E36"
                    />
                </div>

            </div>

            {/* <pre>{JSON.stringify(error, null, 2)}</pre> */}
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};
