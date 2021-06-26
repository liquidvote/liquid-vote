import { gql } from "apollo-server";

export const QuestionTypeDefs = gql`

    type Question {
        questionText: String
        questionType: String
        startText: String
        choices: [JSON]
        groupChannel: JSON
        resultsOn: String

        createdOn: String
        lastEditOn: String
        thisUserIsAdmin: Boolean

        lastVoteOn: String
        userVote: String
        forCount: Int
        againstCount: Int
        forDirectCount: Int
        againstDirectCount: Int
    }

    extend type Query {
        Question(
            questionText: String,
            group: String,
            channel: String
        ): Question
    }

    extend type Mutation {
        editQuestion(
            questionText: String,
            group: String,
            channel: String,
            Question: JSON
        ): JSON
    }
`;