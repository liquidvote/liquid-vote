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
    type: string,
    groupHandle?: string,
    userHandle?: string,
    questionText?: string,
    choiceText?: string,
    inviteLink?: string
}

export const InvitesInput: FunctionComponent<Props> = ({
    type,
    groupHandle,
    userHandle,
    questionText,
    choiceText,
    inviteLink
}) => {

    const [invitesHandlesLoading, setInvitesHandlesLoading] = useState<string[]>([]);

    const [sendInviteNotification, {
        loading: sendInviteNotification_loading,
        error: sendInviteNotification_error,
        data: sendInviteNotification_data,
    }] = useMutation(SEND_INVITE_NOTIFICATION);

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

    return (
        <>

            <div className={`InputWrapper position-relative`}>
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
                                                    {invitesHandlesLoading.includes(n.toUser?.handle) ?
                                                        <img
                                                            className={`vote-avatar`}
                                                            src={'http://images.liquid-vote.com/system/loading.gif'}
                                                        />
                                                        : n.inviteSent ? (
                                                            <small
                                                                className="badge inverted"
                                                            >sent ✅</small>
                                                        ) : (
                                                            <small
                                                                className="button_ inverted small"
                                                                onClick={() => {
                                                                    setInvitesHandlesLoading([
                                                                        ...invitesHandlesLoading,
                                                                        n.toUser?.handle
                                                                    ]);
                                                                    sendInviteNotification({
                                                                        variables: {
                                                                            type,
                                                                            toUserHandle: n.toUser?.handle,
                                                                            questionText,
                                                                            groupHandle,
                                                                            userHandle,
                                                                            inviteLink
                                                                        }
                                                                    }).then(() => {
                                                                        InvitationsSentAndThatCouldBeSent_refetch().then(() => {
                                                                            setInvitesHandlesLoading(
                                                                                invitesHandlesLoading.filter(h => h !== n.toUser?.handle)
                                                                            )
                                                                        })
                                                                    })
                                                                }}
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

