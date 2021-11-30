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
        yourVote: Vote
    }

    type Question {
        _id: ID!
        questionText: String
        questionType: String
        description: String
        startText: String
        choices: [Choice]
        allowNewChoices: Boolean
        groupChannel: GroupChannel
        resultsOn: String

        createdBy: User
        createdOn: String
        lastEditOn: String
        thisUserIsAdmin: Boolean

        stats: QuestionStats
        userVote: Vote
        yourVote: Vote
        group: Group
        votersInCommonStats: VotersInCommonStats
    }

    type Voter {
        handle: String
        avatar: String
        name: String
        representeeCount: Int
    }

    type VotersInCommonStats {
        voterCount: Int
    }

    extend type Query {
        Question(
            questionText: String,
            group: String
        ): Question
        Questions(
            group: String,
            sortBy: String
        ): [Question]
        VotersAlsoVotedOn(
            questionText: String,
            group: String,
            sortBy: String
        ): [Question]
    }

    extend type Mutation {
        editQuestion(
            questionText: String,
            group: String,
            channel: String,
            Question: JSON
        ): JSON,
        addChoice(
            questionText: String,
            group: String,
            newChoice: String
        ): JSON
    }
`;