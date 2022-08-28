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
            agreesWithYou
            lastEditOn
        }
    }
`;

export const INVITATIONS_SENT_AND_THAT_COULD_BE_SENT = gql`
    query {
        InvitationsSentAndThatCouldBeSent {
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

export const MARK_UNSEEN_NOTIFICATIONS_AS_SEEN = gql`
    mutation {
        markUnseenNotificationsAsSeen
    }
`;

export const SEND_INVITE_NOTIFICATION = gql`
    mutation (
        $type: String!
        $toUserHandle: String!
        $actionUserHandle: String!
        $questionText: String
        $groupHandle: String
    ) {
        sendInviteNotification(
            type: $type
            toUserHandle: $toUserHandle
            actionUserHandle: $actionUserHandle
            questionText: $questionText
            groupHandle: $groupHandle
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