import { gql, useMutation } from '@apollo/client';

export const AUTH_USER = gql`
  query {
    authUser
  }
`;

export const AUTH_USER_LOGGEDIN = gql`
  mutation ($Auth0User: JSON!, $firebase_token: String) {
    authUserLoggedIn(Auth0User: $Auth0User, firebase_token: $firebase_token)
  }
`;

export const EDIT_NOTIFICATION_SETTINGS = gql`
  mutation ($notificationSettings: JSON!) {
    editNotificationSettings(notificationSettings: $notificationSettings) {
        allowEmails
        allowNotifications
    }
  }
`;