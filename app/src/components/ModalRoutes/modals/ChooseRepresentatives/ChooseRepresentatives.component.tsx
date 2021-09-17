import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import useSearchParams from "@state/Global/useSearchParams.effect";
import useAuthUser from '@state/AuthUser/authUser.effect';
import useGroup from '@state/Group/group.effect';
import useUserRepresentedBy from "@state/User/userRepresentedBy.effect";
import DropAnimation from '@components/shared/DropAnimation';
import useSearchUsers from '@state/User/searchUsers.effect';
import ProfilePlus from '@shared/Icons/Profile+-small.svg';
import { USER, USER_GROUPS, EDIT_USER_REPRESENTATIVE_GROUP_RELATION } from "@state/User/typeDefs";

import ModalHeader from "../../shared/ModalHeader";
import './style.sass';

interface IFormValues {
    invitedUsers: any[],
    groups: any[]
}

export const ChooseRepresentatives: FunctionComponent<{}> = ({ }) => {

    const [isFocused, setIsFocused] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userHandlesAdding, setUserHandlesAdding] = useState<any[]>([]);
    const [userHandlesRemoving, setUserHandlesRemoving] = useState<any[]>([]);

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const { liquidUser } = useAuthUser();
    const { group } = useGroup({ handle: modalData?.groupHandle });
    const { representatives } = useUserRepresentedBy({
        userHandle: liquidUser?.handle,
        groupHandle: group?.handle
    });

    const { searchUsers } = useSearchUsers({
        searchText: userSearch,
        inGroup: modalData?.groupHandle,
        resultsOnEmpty: true
    })

    const {
        handleSubmit, register, formState: { errors }, watch, setValue
    } = useForm<IFormValues>({
        mode: 'onChange',
        defaultValues: {
            invitedUsers: []
        }
    });

    const [editUserRepresentativeGroupRelation, {
        loading: editUserRepresentativeGroupRelation_loading,
        error: editUserRepresentativeGroupRelation_error,
        data: editUserRepresentativeGroupRelation_data,
    }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION, {
        update: cache => {
            cache.evict({
                id: "ROOT_QUERY",
                fieldName: "UserRepresentedBy",
                args: {
                    userHandle: liquidUser?.handle,
                    groupHandle: group?.handle
                }
            });
            cache.gc();
        }
    });

    const giveRepresentation = (user: any) => {
        console.log(user);

        setUserHandlesAdding([
            ...userHandlesAdding,
            ...(!userHandlesAdding.includes(user.handle) ? [user.handle] : [])
        ]);

        editUserRepresentativeGroupRelation({
            variables: {
                RepresenteeHandle: liquidUser?.handle,
                RepresentativeHandle: user?.handle,
                Group: modalData?.groupHandle,
                IsRepresentingYou: true
            }
        })
            .then((r) => {
                setUserHandlesAdding([
                    ...userHandlesAdding.filter(a => a !== user.handle)
                ]);
            })
    }
    const removeRepresentation = (user: any) => {

        setUserHandlesRemoving([
            ...userHandlesRemoving,
            ...(!userHandlesRemoving.includes(user.handle) ? [user.handle] : [])
        ]);

        editUserRepresentativeGroupRelation({
            variables: {
                RepresenteeHandle: liquidUser?.handle,
                RepresentativeHandle: user?.handle,
                Group: modalData?.groupHandle,
                IsRepresentingYou: false
            }
        })
            .then((r) => {
                setUserHandlesRemoving([
                    ...userHandlesRemoving.filter(a => a !== user.handle)
                ]);
            })
    }

    useEffect(() => {
        setValue('invitedUsers', []);
    }, [modalData?.InviteType]);

    return (
        <form>
            <ModalHeader
                title={
                    !!group ? `Choose Representatives for ${group?.name}` : 'Loading'
                }
                // submitText={`Invite`}
                hideSubmitButton={true}
            />

            <div className="Modal-Content">

                {/* <pre>{JSON.stringify(representatives, null, 2)}</pre>
                <pre>{JSON.stringify(searchUsers, null, 2)}</pre> */}

                {!!representatives ? (
                    <div className={
                        `InputWrapper hasValue ${isFocused && 'isFocused'} my-3`
                    }>
                        <label>
                            Your Representatives
                        </label>
                        <div className="inputElementWrapper">
                            <ul className="userInputList">
                                {representatives?.map((r: any, i: number) => {
                                    return (
                                        <li key={r.handle} className="d-flex mb-2 position-relative">
                                            <div>
                                                <img className="vote-avatar" src={r.avatar} />
                                            </div>
                                            <div className="ml-2">
                                                <p className="m-0">{r.name}</p>
                                                <small>@{r.handle}</small>
                                            </div>
                                            <div className="ml-auto">
                                                {userHandlesRemoving.includes(r.handle) ? (
                                                    <small
                                                        className="badge inverted"
                                                    >removing</small>
                                                ) : (
                                                    <small
                                                        className="badge"
                                                        style={{ maxWidth: 'none' }}
                                                        onClick={() => removeRepresentation(r)}
                                                    >remove representation</small>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                                {/* {value?.
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
                                    ))
                                } */}
                                <li className="position-relative pt-4">
                                    <label className="small">
                                        Other group members
                                    </label>

                                    <div className={
                                        `
                                            InputWrapper
                                            hasValue
                                            ${isFocused && 'isFocused'}
                                            position-relative
                                            mt-3
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
                                        {!!searchUsers && (
                                            <ul className="user-search-results w-100 bg mt-2">
                                                {/* {
                                                    (
                                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSearch) &&
                                                        searchUsers?.length
                                                    ) ? (
                                                        <li
                                                            className="d-flex pointer"
                                                        // onClick={() => sendInvite({ email: userSearch })}
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
                                                    ) : null
                                                } */}
                                                {searchUsers?.
                                                    // filter(u => !value.find(a => a.handle === u.handle)).
                                                    // filter(u => !invites_data?.Invites?.find(a => a.toWhom?.user.handle === u.handle)).
                                                    map(
                                                        u => (
                                                            <li
                                                                key={`invite-user-${u.handle}`}
                                                                className="d-flex pointer"
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

                                                                    {userHandlesAdding.includes(u.handle) ? (
                                                                        <small
                                                                            className="badge inverted"
                                                                        >adding</small>
                                                                    ) : (
                                                                        <small
                                                                            className="badge"
                                                                            style={{ maxWidth: 'none' }}
                                                                            onClick={() => giveRepresentation(u)}
                                                                        >give representation</small>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        )
                                                    )
                                                }
                                            </ul>
                                        )}
                                        {/* {error && <div className="error">{(error as any).message}</div>} */}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                )}


            </div>
        </form>
    );
}

