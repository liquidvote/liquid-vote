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
    placeholder?: string,
    name: string,
    value: string,
    type?: string,
    noLabel?: boolean,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean
}

export const TextAreaInput: FunctionComponent<Props> = ({
    register, labelName, placeholder, name, value, type = 'input', noLabel, error, disabled, autoFocus
}) => {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            {!noLabel && (
                <label>
                    {name}
                </label>
            )}
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">
                <TextareaAutosize
                    {...register}
                    name={name}
                    placeholder={placeholder}
                    type={type || 'input'}
                    disabled={disabled}
                    // autoFocus={autoFocus || false}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                />



                {/* <div>
                    <TextareaAutosize
                        autoFocus
                        name="questionText"
                        ref={register('questionText', {
                            validate: {
                                single: (v: any) =>
                                    v?.length > 5 ||
                                    'please make a question',
                            }
                        })}
                        value={watchAllFields?.questionText?.length ? watchAllFields?.questionText + "?" : ''} //+ "?"
                        placeholder="Ask a question..."
                        onSelect={(e: any) => {
                            // move cursor to before "?"
                            if (e.target.value.length === e.target.selectionStart) {
                                e.target.selectionStart = e.target.value.length - 1;
                                e.target.selectionEnd = e.target.value.length - 1;
                            }
                        }}
                        onChange={(e) => {
                            // remove "?" from value
                            setValue(
                                "questionText",
                                e.target.value.replaceAll('?', ''),
                                // { shouldValidate: true }
                            );
                        }}
                    />
                    {errors?.questionText && <div className="error pl-0 mt-n2">{errors?.questionText.message}</div>}
                </div> */}


            </div>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
};

