import { gql } from "apollo-server";

export const QuestionTypeDefs = gql`

    type QuestionStats {
        lastVoteOn: String                  #
        forCount: Int                       #
        forDirectCount: Int                 #
        forMostRepresentedVoters: [JSON]
        againstCount: Int                   #
        againstMostRepresentedVoters: [JSON]   #
        againstDirectCount: Int
    }

    type Choice {
        text: String,

        stats: QuestionStats
        userVote: Vote
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
        userVote: Vote
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