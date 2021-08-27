import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { useQuery, useMutation } from "@apollo/client";

import { INVITES, EDIT_INVITE } from "@state/Invites/typeDefs";
import { SEARCH_USERS } from "@state/User/typeDefs";
import ProfilePlus from '@shared/Icons/Profile+-small.svg';

import './style.sass';

type Props = {
    label?: string,

    groupName?: string,
    groupHandle?: string,
    fromWhomAvatar?: string,
    fromWhomName?: string,
    fromWhomHandle?: string,
}

export const InvitesLink: FunctionComponent<Props> = ({
    label,
    groupName,
    groupHandle,
    fromWhomAvatar,
    fromWhomName,
    fromWhomHandle
}) => {

    const [isFocused, setIsFocused] = useState(false);

    const link = `http://localhost:8080/group/${groupHandle}?${new URLSearchParams({
        modal: 'AcceptInvite',
        modalData: JSON.stringify({
            toWhat: 'group',
            groupName: groupName,
            groupHandle: groupHandle,
            fromWhomAvatar: fromWhomAvatar,
            fromWhomName: fromWhomName,
            fromWhomHandle: fromWhomHandle
        })
    }).toString()}`;

    return (
        <div className={
            `InputWrapper hasValue ${isFocused && 'isFocused'}`
        }>
            <label>
                {label}
            </label>

            <div className="inputElementWrapper">
                <div className="inputElementWrapper">
                    <input
                        // name="adminPicker"
                        type={'input'}
                        // disabled={disabled}
                        // autoFocus={autoFocus || false}
                        value={link}
                        onClick={e => e.target.select()}
                        // onChange={(e) => setUserSearch(e.target.value)}
                        onBlur={() => setIsFocused(false)}
                        onFocus={() => setIsFocused(true)}
                    />
                </div>
            </div>
        </div>
    );
}

