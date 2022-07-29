import { gql } from "apollo-server-lambda";

export const AuthUserTypeDefs = gql`
    extend type Query {
        authUser: JSON
    }

    extend type Mutation {
        authUserLoggedIn(Auth0User: JSON, firebase_token: String): JSON
    }

    # type AuthUser {
    #     name: String,
    #     avatarUrl: String
    # }
`;