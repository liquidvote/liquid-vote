import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useQuery, useMutation } from "@apollo/client";

import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { SEARCH_USERS } from "@state/User/typeDefs";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    name: string,
    label?: string,
    value: any,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any
}

export const InvitesInput: FunctionComponent<Props> = ({
    register,
    name,
    label,
    value,
    error,
    disabled,
    autoFocus,
    setValue
}) => {

    const [editInvite, {
        loading: editInvite_loading,
        error: editInvite_error,
        data: editInvite_data,
    }] = useMutation(EDIT_INVITE);


    const [isFocused, setIsFocused] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    const {
        loading: searchUsers_loading,
        error: searchUsers_error,
        data: searchUsers_data,
        refetch: searchUsers_refetch
    } = useQuery(SEARCH_USERS, {
        variables: { text: userSearch },
        // skip: !userSearch
    });

    console.log({
        searchUsers_data
    });

    const sendInvite = (u) => {
        setUserSearch('');
        setValue(
            name,
            [
                ...value,
                {
                    ...u,
                    sending: true
                }
            ]
        );

        editInvite({
            variables: {
                Invite: {
                    toWhat: 'group',
                    toWhom: {
                        user: u.handle,
                        email: u.email
                        group
                        question
                    }
                }
            }
        }).then(r => {
            console.log({
                r
            })
        });;
    }

    return (
        <div className={
            `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'}`
        }>
            <label>
                {label || name}
            </label>
            {/* <div className="letter-count">

            </div> */}
            <div className="inputElementWrapper">
                <ul className="adminsInputList">
                    {value?.map((v: any, i: Number) => (
                        <li key={v.name + i} className="d-flex mb-2 position-relative">
                            <div>
                                <img className="vote-avatar" src={v.avatar} />
                            </div>
                            <div className="ml-2">
                                <p className="m-0">{v.name}</p>
                                <small>@{v.handle}</small>
                            </div>
                            {v.sending && (
                                <div className="ml-auto">
                                    <small className="badge">sending</small>
                                </div>
                            )}
                        </li>
                    ))}
                    <li>
                        <div className={
                            `
                                InputWrapper
                                ${userSearch.length > 0 && 'hasValue'}
                                ${error && 'hasError'}
                                ${isFocused && 'isFocused'}
                                position-relative
                            `
                        }>
                            <label>
                                User name or handle, or new user's email
                            </label>
                            <div className="inputElementWrapper">
                                <input
                                    name="adminPicker"
                                    type={'input'}
                                    // disabled={disabled}
                                    // autoFocus={autoFocus || false}
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    onBlur={() => setIsFocused(false)}
                                    onFocus={() => setIsFocused(true)}
                                />
                            </div>
                            {!!searchUsers_data && (
                                <ul className="admin-search-results w-100 bg mt-2">
                                    {searchUsers_data?.SearchUsers?.
                                        filter(u => !value.find(a => a.handle === u.handle)).
                                        map(
                                            u => (
                                                <li
                                                    key={`invite-user-${u.handle}`}
                                                    className="d-flex pointer"
                                                    onClick={() => sendInvite(u)}
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
                                                    <div className="ml-auto">
                                                        <small className="badge inverted">send invite</small>
                                                    </div>
                                                </li>
                                            )
                                        )
                                    }
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

