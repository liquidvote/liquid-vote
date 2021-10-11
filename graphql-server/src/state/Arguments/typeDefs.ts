import { gql } from "apollo-server-lambda";

export const ArgumentTypeDefs = gql`

    type Argument {
        argumentText: String

        question: Question
        user: User
        group: Group
        vote: Vote

        createdOn: String
        lastEditOn: String
    }

    extend type Query {
        Argument(questionText: String, groupHandle: String, userHandle: String): Argument
        Arguments(questionText: String, groupHandle: String, userHandle: String, sortBy: String): [Argument]
    }

    extend type Mutation {
        editArgument(ArgumentEdits: JSON, questionText: String, groupHandle: String, userHandle: String): Argument
    }
`;