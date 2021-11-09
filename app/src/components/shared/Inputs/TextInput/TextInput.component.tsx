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
    labelName?: string,
    name: string,
    value: string,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    loading?: boolean,
    precedingText?: string
}

export const TextInput: FunctionComponent<Props> = ({
    register, labelName, name, value, type = 'input', error, disabled, autoFocus, loading, precedingText
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {name}
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
                <input
                    {...register}
                    name={name}
                    type={type || 'input'}
                    disabled={disabled}
                    // autoFocus={autoFocus || false}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    style={{
                        ...!!precedingText && { paddingLeft: `${precedingText.length * 8 + 20}px` }
                    }}
                />
            </div>
            {!!precedingText && <span className="preceding-text">{precedingText}</span>}
            {/* <pre>{JSON.stringify(error, null, 2)}</pre> */}
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};
