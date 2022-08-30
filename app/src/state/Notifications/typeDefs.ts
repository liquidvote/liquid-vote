import { gql, useMutation } from '@apollo/client';

export const YOUR_NOTIFICATIONS = gql`
  query {
        YourNotifications {
            type
            seen
            actionUser {
                handle
                name
                avatar
            }
            choiceText
            question {
                questionText
                questionType
            }
            group {
                name
                handle
            }
            user {
                handle
                name
                avatar
            }
            inviterUser {
                handle
                name
                avatar
            }
            inviteLink
            agreesWithYou
            lastEditOn
        }
    }
`;

export const INVITATIONS_SENT_AND_THAT_COULD_BE_SENT = gql`
    query (
        $type: String!
        $questionText: String
        $choiceText: String
        $groupHandle: String
        $userHandle: String
    ) {
        InvitationsSentAndThatCouldBeSent(
            type: $type
            questionText: $questionText
            choiceText: $choiceText
            groupHandle: $groupHandle
            userHandle: $userHandle
        ) {
            type
            seen
            inviteSent
            toUser {
                handle
                name
                avatar
            }
            choiceText
            question {
                questionText
                questionType
            }
            group {
                name
                handle
            }
            agreesWithYou
            lastEditOn
        }
    }
`;

export const MARK_UNSEEN_NOTIFICATIONS_AS_SEEN = gql`
    mutation {
        markUnseenNotificationsAsSeen
    }
`;

export const SEND_INVITE_NOTIFICATION = gql`
    mutation (
        $type: String!
        $toUserHandle: String!
        $questionText: String
        $groupHandle: String
        $userHandle: String
        $inviteLink: String
    ) {
        sendInviteNotification(
            type: $type,
            toUserHandle: $toUserHandle,
            questionText: $questionText,
            groupHandle: $groupHandle,
            userHandle: $userHandle
            inviteLink: $inviteLink
        ) {
            type
            seen
            actionUser {
                handle
                name
                avatar
            }
            choiceText
            question {
                questionText
                questionType
            }
            group {
                name
                handle
            }
            agreesWithYou
            lastEditOn  
        }
    }
`;