import { gql } from "apollo-server-lambda";

export const QuestionTypeDefs = gql`

    type QuestionStats {
        lastVoteOn: String                  #
        forCount: Float                       #
        forDirectCount: Float                 #
        forMostRepresentingVoters: [Voter]
        againstCount: Float                   #
        againstMostRepresentingVoters: [Voter]   #
        againstDirectCount: Float
        directVotes: Float
        indirectVotes: Float
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

    type Voter {
        handle: String
        avatar: String
        name: String
        representeeCount: Int
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
        QuestionVoters(
            questionText: String,
            choiceText: String,
            group: String,
            channel: String,
            typeOfVoter: String,
            sortBy: String
        ): [Vote]
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