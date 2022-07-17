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
import { RepresentativeInList } from './RepresentativeInList.component';

import './style.sass';

interface IFormValues {
    invitedUsers: any[],
}

export const ChooseRepresentatives: FunctionComponent<{ inviterHandle?: string }> = ({ inviterHandle }) => {

    const [isFocused, setIsFocused] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userHandlesAdding, setUserHandlesAdding] = useState<any[]>([]);
    const [userHandlesRemoving, setUserHandlesRemoving] = useState<any[]>([]);

    const { allSearchParams, updateParams } = useSearchParams();
    const modalData = JSON.parse(allSearchParams.modalData);

    const { liquidUser } = useAuthUser();
    const { group } = useGroup({ handle: modalData?.groupHandle });
    const { representatives, representatives_refetch, representatives_loading } = useUserRepresentedBy({
        userHandle: liquidUser?.handle,
        groupHandle: group?.handle
    });

    const { searchUsers, searchUsers_loading } = useSearchUsers({
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
    }] = useMutation(EDIT_USER_REPRESENTATIVE_GROUP_RELATION);

    const giveRepresentation = (user: any) => {

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
            .then(async (r) => {
                representatives_refetch();
                setUserHandlesAdding([
                    ...userHandlesAdding.filter(a => a !== user.handle)
                ]);

                updateParams({
                    paramsToAdd: { refetch: 'questions' }
                });
                setTimeout(() => {
                    updateParams({
                        paramsToAdd: { refetch: 'group' }
                    });
                });
                setTimeout(() => {
                    updateParams({
                        paramsToAdd: { refetch: 'question' }
                    });
                }, 2);
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
                representatives_refetch();
                setUserHandlesRemoving([
                    ...userHandlesRemoving.filter(a => a !== user.handle)
                ]);

                updateParams({
                    paramsToAdd: { refetch: 'questions' }
                });
                setTimeout(() => {
                    updateParams({
                        paramsToAdd: { refetch: 'group' }
                    });
                });
            })
    }

    useEffect(() => {
        setValue('invitedUsers', []);
    }, [modalData?.InviteType]);

    return (
        <div className="my-3">
            <div className="position-relative pt-1">
                <div>
                    <ul className="userInputList">
                        {representatives?.map((r: any, i: number) => (
                            <RepresentativeInList
                                key={r.handle}
                                u={r}
                                isRemoving={userHandlesRemoving.includes(r.handle)}
                                buttonText="remove representation"
                                buttonFunction={() => removeRepresentation(r)}
                                groupHandle={modalData?.groupHandle}
                            />
                        ))}
                        {searchUsers?.
                            filter(u => userHandlesAdding.includes(u.handle))?.
                            map((r: any, i: number) => (
                                <RepresentativeInList
                                    key={r.handle}
                                    u={r}
                                    isAdding={true}
                                    groupHandle={modalData?.groupHandle}
                                />
                            ))
                        }
                    </ul>
                </div>
                <div className="inputElementWrapper mx-2 my-n2">
                    <div className={
                        `
                                InputWrapper
                                hasValue
                                ${isFocused && 'isFocused'}
                                position-relative
                            `
                    }>
                        <label>
                            Search group members
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
                    </div>
                </div>
                {(searchUsers_loading || !searchUsers) ? (
                    <div className="d-flex justify-content-center my-5">
                        <DropAnimation />
                    </div>
                ) : !!searchUsers?.length ? (
                    <ul className="userInputList">
                        {searchUsers?.
                            filter(u => !userHandlesAdding.includes(u.handle))?.
                            filter(u => !representatives?.find(r => r.handle === u.handle))?.
                            // filter(u => liquidUser?.handle !== u.handle)?.
                            sort((a, b) => a.handle === inviterHandle ? -1 : 1)?.
                            map(
                                u => (
                                    <RepresentativeInList
                                        key={u.handle}
                                        u={u}
                                        // isRemoving={userHandlesRemoving.includes(u.handle)}
                                        buttonText="give representation"
                                        buttonFunction={() => giveRepresentation(u)}
                                        groupHandle={modalData?.groupHandle}
                                    />
                                )
                            )
                        }
                    </ul>
                ) : (
                    <p className="my-3">no matches</p>
                )}
            </div>
        </div>
    );
}

