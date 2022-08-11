import { gql } from "apollo-server-lambda";

export const AuthUserTypeDefs = gql`

    type NotificationSettings {
        allowEmails: Boolean
        allowNotifications: Boolean
    }

    extend type Query {
        authUser: JSON
    }

    extend type Mutation {
        authUserLoggedIn(Auth0User: JSON, firebase_token: String): JSON
        editNotificationSettings(notificationSettings: JSON): NotificationSettings
    }

    # type AuthUser {
    #     name: String,
    #     avatarUrl: String
    # }
`;