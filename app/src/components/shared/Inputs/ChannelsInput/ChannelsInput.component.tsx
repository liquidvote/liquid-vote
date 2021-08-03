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
    autoFocus?: boolean,
    setValue: any
}

export const ChannelsInput: FunctionComponent<Props> = ({
    register, name, value, error, disabled, autoFocus, setValue
}) => {

    const [isFocused, setIsFocused] = useState(false);
    const [newChannel, setNewChannel] = useState('');

    const addChannel = () => {
        setValue(
            name,
            [
                ...value,
                { name: newChannel, preSave: true }
            ]
        );
        setNewChannel('');
    }

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {name}
            </label>

            <div className="inputElementWrapper">
                <ul className="adminsInputList">
                    {value?.map((v: any, i: Number) => (
                        <li key={`channel-${v.name + i}`} className="d-flex mb-2 position-relative">
                            {v.name}
                            {v.preSave && (
                                <div className="ml-auto">
                                    <small className="badge">creates on save</small>
                                </div>
                            )}
                        </li>
                    ))}

                    <li>
                        <div className={
                            `
                                InputWrapper
                                ${newChannel.length > 0 && 'hasValue'}
                                ${error && 'hasError'}
                                ${isFocused && 'isFocused'}
                                position-relative
                            `
                        }>
                            <label>
                                Name a new channel
                            </label>
                            <div className="inputElementWrapper d-flex align-items-center">
                                <input
                                    name="adminPicker"
                                    type={'input'}
                                    // disabled={disabled}
                                    // autoFocus={autoFocus || false}
                                    value={newChannel}
                                    onChange={(e) => setNewChannel(e.target.value)}
                                    onBlur={() => setIsFocused(false)}
                                    onFocus={() => setIsFocused(true)}
                                />
                                <button
                                    className="button_ ml-2"
                                    disabled={!newChannel}
                                    onClick={addChannel}
                                >
                                    Add
                                </button>
                            </div>
                            {error && <div className="error">{(error as any).message}</div>}
                        </div>
                    </li>



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

