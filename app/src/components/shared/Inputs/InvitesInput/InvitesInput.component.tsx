import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useQuery, useMutation } from "@apollo/client";

import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { SEARCH_USERS } from "@state/User/typeDefs";
import ProfilePlus from '@shared/Icons/Profile+-small.svg';

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
    setValue: any,
    groupHandle?: string,
    userHandle?: string,
    questionText?: string
}

export const InvitesInput: FunctionComponent<Props> = ({
    register,
    name,
    label,
    value,
    error,
    disabled,
    autoFocus,
    setValue,
    groupHandle,
    userHandle,
    questionText
}) => {

    const [editInvite, {
        loading: editInvite_loading,
        error: editInvite_error,
        data: editInvite_data,
    }] = useMutation(EDIT_INVITE);


    const [isFocused, setIsFocused] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    const {
        loading: invites_loading,
        error: invites_error,
        data: invites_data,
        refetch: invites_refetch
    } = useQuery(INVITES, {
        variables: {
            groupHandle,
            // inviterUserHandle,
            // invitedUserHandle,
        }
    });

    console.log({
        invites_data
    });

    const {
        loading: searchUsers_loading,
        error: searchUsers_error,
        data: searchUsers_data,
        refetch: searchUsers_refetch
    } = useQuery(SEARCH_USERS, {
        variables: {
            text: userSearch,
            // notInGroup: groupHandle
        }
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
                    toWhat: {
                        type: 'group',
                        group: groupHandle,
                        question: questionText,
                        user: userHandle
                    },
                    toWhom: {
                        user: u.handle,
                        email: u.email,
                    },
                }
            }
        }).then(r => {
            setTimeout(() => invites_refetch(), 100);
            setTimeout(() => invites_refetch(), 1000);
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
                    {invites_data?.Invites?.map((invite: any, i: number) => {

                        const invitee = invite?.toWhom?.user;

                        return (
                            <li key={invitee.name + i} className="d-flex mb-2 position-relative">
                                <div>
                                    <img className="vote-avatar" src={invitee.avatar} />
                                </div>
                                <div className="ml-2">
                                    <p className="m-0">{invitee.name}</p>
                                    <small>@{invitee.handle}</small>
                                </div>
                                <div className="ml-auto">
                                    <small className="badge">{invite.status}</small>
                                </div>
                            </li>
                        )
                    })}
                    {value?.
                        filter(
                            u => !invites_data?.Invites?.find(a => a.toWhom?.user.handle === u.handle)
                        )
                        .map((v: any, i: Number) => (
                            <li key={v.name + i} className="d-flex mb-2 position-relative">
                                <div>
                                    {!!v.email ? (
                                        <div className="vote-avatar border-0 p-1">
                                            <ProfilePlus />
                                        </div>
                                    ) : (
                                        <img className="vote-avatar" src={v.avatar} />
                                    )}
                                </div>
                                <div className="ml-2">
                                    {!!v.email ? (
                                        <>
                                            <p className="m-0">{v.email}</p>
                                            <small>new user</small>
                                        </>
                                    ) : (
                                        <>
                                            <p className="m-0">{v.name}</p>
                                            <small>@{v.handle}</small>
                                        </>
                                    )}
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
                                e-mail, username or handle
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
                                    {
                                        (
                                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSearch) &&
                                            !searchUsers_data?.SearchUsers?.length
                                        ) ? (
                                            <li
                                                className="d-flex pointer"
                                                onClick={() => sendInvite({ email: userSearch })}
                                            >
                                                <div>
                                                    <div className="vote-avatar border-0 p-1">
                                                        <ProfilePlus />
                                                    </div>
                                                </div>
                                                <div className="ml-2">
                                                    <p className="m-0">{userSearch}</p>
                                                    <small>new user</small>
                                                </div>
                                                <div className="ml-auto">
                                                    <small className="badge inverted">send invite</small>
                                                </div>
                                            </li>
                                        ) : null}
                                    {searchUsers_data?.SearchUsers?.
                                        filter(u => !value.find(a => a.handle === u.handle)).
                                        filter(u => !invites_data?.Invites?.find(a => a.toWhom?.user.handle === u.handle)).
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

