import { gql } from "apollo-server";

export const QuestionTypeDefs = gql`

    type QuestionStats {
        lastVoteOn: String
        forCount: Int
        forDirectCount: Int
        forMostRelevantVoters: [JSON]
        againstCount: Int
        againstMostRelevantVoters: [JSON]
        againstDirectCount: Int
        userVote: Vote
    }

    type Choice {
        text: String,

        stats: QuestionStats
    }

    type Question {
        questionText: String
        questionType: String
        startText: String
        choices: [Choice]
        groupChannel: GroupChannel
        resultsOn: String

        # createdBy
        createdOn: String
        lastEditOn: String
        thisUserIsAdmin: Boolean

        stats: QuestionStats
    }

    extend type Query {
        Question(
            questionText: String,
            group: String,
            channel: String
        ): Question
        Questions(
            group: String,
            channels: [String]
        ): [Question]
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