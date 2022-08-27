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

export const MARK_UNSEEN_NOTIFICATIONS_AS_SEEN = gql`
    mutation {
        markUnseenNotificationsAsSeen
    }
`;