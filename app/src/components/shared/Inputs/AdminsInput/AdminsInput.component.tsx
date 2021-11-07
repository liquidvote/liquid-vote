import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useQuery } from "@apollo/client";

import { SEARCH_USERS } from "@state/User/typeDefs";
import XSVG from "@shared/Icons/X.svg";

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

export const AdminsInput: FunctionComponent<Props> = ({
    register, name, value, error, disabled, autoFocus, setValue
}) => {

    const [isFocused, setIsFocused] = useState(false);
    const [newAdminSearch, setNewAdminSearch] = useState('');

    const {
        loading: searchUsers_loading,
        error: searchUsers_error,
        data: searchUsers_data,
        refetch: searchUsers_refetch
    } = useQuery(SEARCH_USERS, {
        variables: { text: newAdminSearch },
        skip: !newAdminSearch
    });

    const addAdmin = (u) => {
        setNewAdminSearch('');
        setValue(
            name,
            [
                ...value,
                {
                    ...u,
                    preSave: true
                }
            ]
        );
    }

    const removeAdmin = (u) => {
        setValue(
            name,
            [
                ...value
                    .filter(u_ => !(u_.preSave && u.handle === u_.handle))
                    .map(u_ => ({
                        ...u_,
                        ...u.handle === u_.handle && {
                            remove: true
                        }
                    })),
            ]
        );
    }

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
                        <li key={v.name + i} className="d-flex mb-2 justify-content-between">
                            <div className="d-flex">
                                <div>
                                    <img className="vote-avatar" src={v.avatar} />
                                </div>
                                <div className="ml-2">
                                    <p className="m-0">{v.name}</p>
                                    <small>@{v.handle}</small>
                                </div>
                            </div>
                            <div className="d-flex">
                                {v.preSave && (
                                    <div className="ml-2">
                                        <small className="badge">admin on save</small>
                                    </div>
                                )}
                                {v.remove && (
                                    <div className="ml-2">
                                        <small className="badge">removed on save</small>
                                    </div>
                                )}
                                {(!v.remove && i !== 0) && (
                                    <div className="ml-2 pointer" onClick={() => removeAdmin(v)}>
                                        <XSVG />
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                    <li>
                        <div className={
                            `
                                InputWrapper
                                ${newAdminSearch.length > 0 && 'hasValue'}
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
                                    name="adminPicker"
                                    type={'input'}
                                    // disabled={disabled}
                                    // autoFocus={autoFocus || false}
                                    value={newAdminSearch}
                                    onChange={(e) => setNewAdminSearch(e.target.value)}
                                    onBlur={() => setIsFocused(false)}
                                    onFocus={() => setIsFocused(true)}
                                />
                            </div>
                            {!!newAdminSearch && !!searchUsers_data && (
                                <ul className="admin-search-results position-absolute w-100 bg mt-1 on-top">
                                    {searchUsers_data?.SearchUsers?.
                                        filter(u => !value.find(a => a.handle === u.handle)).
                                        map(
                                            u => (
                                                <li
                                                    key={`admin-user-${u.handle}`}
                                                    className="d-flex pointer"
                                                    onClick={() => addAdmin(u)}
                                                >
                                                    <div>
                                                        <img
                                                            className="vote-avatar"
                                                            src={u.avatar}
                                                        />
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="m-0">{u.name}</p>
                                                        <small>@{u.handle}</small>
                                                    </div>
                                                </li>
                                            ))}
                                </ul>
                            )}
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
            {/* <pre>
                {JSON.stringify(value, null, 2)}
            </pre> */}
            {error && <div className="error">{(error as any).message}</div>}
        </div>
    );
}

