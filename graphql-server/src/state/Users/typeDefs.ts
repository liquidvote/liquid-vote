import { gql } from "apollo-server";

export const UserTypeDefs = gql`
    extend type Query {
        User(handle: String): JSON
    }

    extend type Mutation {
        editUser(User: JSON): JSON
    }
`;