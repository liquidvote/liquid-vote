import { gql } from "apollo-server-lambda";

export const QuestionTypeDefs = gql`

    type QuestionStats {
        lastVoteOn: String                      #
        forCount: Float                         #
        forDirectCount: Float                   #
        forMostRepresentingVoters: [Voter]      # TODO: Comparison Circles
        againstCount: Float                     #
        againstMostRepresentingVoters: [Voter]  # TODO: Comparison Circles
        againstDirectCount: Float
        directVotes: Float
        indirectVotes: Float
    }

    type YourQuestionStats {
        votersYouFollow: [Voter]
    }

    type Choice {
        text: String,

        stats: QuestionStats
        yourStats: YourQuestionStats
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
        yourStats: YourQuestionStats
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
        stats: UserStats
        yourStats:  YourUserStats
        vote: Vote
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
        QuestionsCreatedByUser(
            handle: String,
            sortBy: String
        ):  [Question]
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