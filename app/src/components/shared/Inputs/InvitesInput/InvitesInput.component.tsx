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
import Avatar from "@components/shared/Avatar";

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

    const {
        loading: searchUsers_loading,
        error: searchUsers_error,
        data: searchUsers_data,
        refetch: searchUsers_refetch
    } = useQuery(SEARCH_USERS, {
        variables: {
            text: userSearch,
            notInGroup: groupHandle,
            isFollowing: true
        }
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
        <>

            <div className={
                `
                    InputWrapper
                    ${userSearch.length > 0 && 'hasValue'}
                    ${error && 'hasError'}
                    ${isFocused && 'isFocused'}
                    position-relative
                `
            }>
                {!!searchUsers_data && (
                    <ul className="invitesInputList invites-search-results w-100 bg mt-2">
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
                            map(
                                u => (
                                    <li
                                        key={`invite-user-${u.handle}`}
                                        className="d-flex pointer"
                                        onClick={() => sendInvite(u)}
                                    >
                                        <div className='mt-n1'>
                                            <Avatar
                                                person={u}
                                                // groupHandle={v?.groupChannel?.group}
                                                type="small"
                                            />
                                            {/* <img
                                                        className="vote-avatar"
                                                        src={u.avatar}
                                                    /> */}
                                        </div>
                                        <div className="ml-2">
                                            <p className="m-0 white">{u.name}</p>
                                            <small>@{u.handle}</small>
                                        </div>
                                        <div className="ml-auto">
                                            <small className="button_ small">send invite</small>
                                        </div>
                                    </li>
                                )
                            )
                        }
                    </ul>
                )}
                {error && <div className="error">{(error as any).message}</div>}
            </div>

        </>

    );
}

