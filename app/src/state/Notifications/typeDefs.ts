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
