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
    const { representatives, representatives_refetch } = useUserRepresentedBy({
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
            .then((r) => {
                representatives_refetch();
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
                representatives_refetch();
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
                                {representatives?.map((r: any, i: number) => (
                                    <RepresentativeInList
                                        key={r.handle}
                                        u={r}
                                        isRemoving={userHandlesRemoving.includes(r.handle)}
                                        buttonText="remove representation"
                                        buttonFunction={() => removeRepresentation(r)}
                                    />
                                ))}
                                {searchUsers?.
                                    filter(u => userHandlesAdding.includes(u.handle))?.
                                    map((r: any, i: number) => (
                                        <RepresentativeInList
                                            key={r.handle}
                                            u={r}
                                            isAdding={true}
                                        />
                                    ))
                                }
                                {
                                    (
                                        !representatives?.length &&
                                        !searchUsers?.filter(u => userHandlesAdding.includes(u.handle)).length
                                    ) && (
                                        <div className="pb-3 text-center">
                                            No one is represening you on this group yet.
                                        </div>
                                    )}
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
                                                {searchUsers?.
                                                    filter(u => !userHandlesAdding.includes(u.handle))?.
                                                    filter(u => !representatives?.find(r => r.handle === u.handle))?.
                                                    map(
                                                        u => (
                                                            <RepresentativeInList
                                                                key={u.handle}
                                                                u={u}
                                                                // isRemoving={userHandlesRemoving.includes(u.handle)}
                                                                buttonText="give representation"
                                                                buttonFunction={() => giveRepresentation(u)}
                                                            />
                                                            // <li
                                                            //     key={`invite-user-${u.handle}`}
                                                            //     className="d-flex pointer"
                                                            // >
                                                            //     <div>
                                                            //         <img
                                                            //             className="vote-avatar"
                                                            //             src={u.avatar}
                                                            //         />
                                                            //     </div>
                                                            //     <div className="ml-2">
                                                            //         <p className="m-0">{u.name}</p>
                                                            //         <small>@{u.handle}</small>
                                                            //     </div>
                                                            //     <div className="ml-auto">
                                                            //         {userHandlesAdding.includes(u.handle) ? (
                                                            //             <small
                                                            //                 className="badge inverted"
                                                            //             >adding</small>
                                                            //         ) : (
                                                            //             <small
                                                            //                 className="badge"
                                                            //                 style={{ maxWidth: 'none' }}
                                                            //                 onClick={() => giveRepresentation(u)}
                                                            //             >give representation</small>
                                                            //         )}
                                                            //     </div>
                                                            // </li>
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

