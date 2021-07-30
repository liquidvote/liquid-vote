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
    const [newAdminSearch, setNewAdminSearch]= useState('');

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
                        <li key={v.name + i} className="d-flex mb-2">
                            <div>
                                <img className="vote-avatar" src={v.avatar} />
                            </div>
                            <div className="ml-2">
                                <p className="m-0">{v.name}</p>
                                <small>@{v.handle}</small>
                            </div>
                        </li>
                    ))}
                    <li>
                        <div className={
                            `
                                InputWrapper
                                ${newAdminSearch.length > 1 && 'hasValue'}
                                ${error && 'hasError'}
                                ${isFocused && 'isFocused'}
                                position-relative
                            `
                        }>
                            <label>
                                Pick a new admin
                            </label>
                            <div className="inputElementWrapper">
                                <input
                                    name={name}
                                    type={'input'}
                                    // disabled={disabled}
                                    // autoFocus={autoFocus || false}
                                    onBlur={() => setIsFocused(false)}
                                    onFocus={() => setIsFocused(true)}
                                />
                            </div>
                            <ul className="admin-search-results position-absolute w-100 bg mt-1">
                                <li className="d-flex">
                                    <div>
                                        <img
                                            className="vote-avatar"
                                            src="https://s.gravatar.com/avatar/dc672722ebcd2548f34b3e6f3dfea2c5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fbu.png"
                                        />
                                    </div>
                                    <div className="ml-2">
                                        <p className="m-0">Dude</p>
                                        <small>@dude</small>
                                    </div>
                                </li>
                                <li className="d-flex">
                                    <div>
                                        <img
                                            className="vote-avatar"
                                            src="https://s.gravatar.com/avatar/dc672722ebcd2548f34b3e6f3dfea2c5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fbu.png"
                                        />
                                    </div>
                                    <div className="ml-2">
                                        <p className="m-0">Dude</p>
                                        <small>@dude</small>
                                    </div>
                                </li>
                                {/* <li>
                                    <img
                                        className="vote-avatar"
                                        src="https://s.gravatar.com/avatar/dc672722ebcd2548f34b3e6f3dfea2c5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fbu.png"
                                    />
                                    Dude <small>@dude</small>
                                </li> */}
                            </ul>
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
            <pre>
                {JSON.stringify(value, null, 2)}
            </pre>
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
}

