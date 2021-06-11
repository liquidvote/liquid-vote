import { gql } from "apollo-server";

export const AuthUserTypeDefs = gql`
    extend type Query {
        authUser: JSON
    }

    extend type Mutation {
        authUserLoggedIn(Auth0User: JSON): JSON
    }

    # type AuthUser {
    #     name: String,
    #     avatarUrl: String
    # }
`;