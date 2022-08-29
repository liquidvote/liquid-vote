import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useQuery, useMutation } from "@apollo/client";

import { INVITATIONS_SENT_AND_THAT_COULD_BE_SENT, SEND_INVITE_NOTIFICATION } from "@state/Notifications/typeDefs";
import { SEARCH_USERS } from "@state/User/typeDefs";
import ProfilePlus from '@shared/Icons/Profile+-small.svg';
import Avatar from "@components/shared/Avatar";
import PersonInList from '@components/shared/PersonInList';
import DropAnimation from "@shared/DropAnimation";

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    name: string,
    label?: string,
    value: any,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any,
    type: string,
    groupHandle?: string,
    userHandle?: string,
    questionText?: string,
    choiceText?: string,
}

export const InvitesInput: FunctionComponent<Props> = ({
    type,
    groupHandle,
    userHandle,
    questionText,
    choiceText
}) => {

    const [sendInviteNotification, {
        loading: sendInviteNotification_loading,
        error: sendInviteNotification_error,
        data: sendInviteNotification_data,
    }] = useMutation(SEND_INVITE_NOTIFICATION);

    const [isFocused, setIsFocused] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    console.log({
        type,
        groupHandle,
        userHandle,
        questionText,
        choiceText
    });

    const {
        loading: InvitationsSentAndThatCouldBeSent_loading,
        error: InvitationsSentAndThatCouldBeSent_error,
        data: InvitationsSentAndThatCouldBeSent_data,
        refetch: InvitationsSentAndThatCouldBeSent_refetch
    } = useQuery(INVITATIONS_SENT_AND_THAT_COULD_BE_SENT, {
        variables: {
            type,
            questionText,
            choiceText,
            groupHandle,
            userHandle
        }
    });

    console.log({ InvitationsSentAndThatCouldBeSent_data });

    return (
        <>

            <div className={
                `
                    InputWrapper
                    ${userSearch.length > 0 && 'hasValue'}
                    ${isFocused && 'isFocused'}
                    position-relative
                `
            }>
                {!!InvitationsSentAndThatCouldBeSent_data && (
                    <ul className="invitesInputList invites-search-results w-100 bg mt-2">

                        {InvitationsSentAndThatCouldBeSent_data?.InvitationsSentAndThatCouldBeSent?.
                            map(
                                n => (
                                    <li key={`invite-user-${n.toUser?.handle}`}>
                                        <PersonInList
                                            person={n.toUser}
                                            alternativeButton={
                                                <>
                                                    {n.inviteSent ? (
                                                        <small
                                                            className="badge inverted"
                                                        >sent ✅</small>
                                                    ) : (
                                                        <small
                                                            className="button_ inverted small"
                                                            onClick={() => sendInviteNotification({
                                                                variables: {
                                                                    type,
                                                                    toUserHandle: n.toUser?.handle,
                                                                    questionText,
                                                                    groupHandle,
                                                                    userHandle
                                                                }
                                                            }).then(() => {
                                                                InvitationsSentAndThatCouldBeSent_refetch();
                                                            })
                                                            }
                                                        >send invite</small>
                                                    )}
                                                </>
                                            }
                                            hideBottomBorder={true}
                                        />
                                    </li>
                                )
                            )
                        }
                    </ul>
                )}

                {InvitationsSentAndThatCouldBeSent_loading && (
                    <div className="d-flex align-items-center justify-content-center w-100">
                        <DropAnimation />
                    </div>
                )}
            </div>

        </>

    );
}

