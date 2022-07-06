import { gql } from "apollo-server-lambda";

export const QuestionTypeDefs = gql`

    type QuestionStats {
        lastVoteOn: String

        forMostRepresentingVoters: [Voter]
        againstMostRepresentingVoters: [Voter]

        # Count
        forCount: Float
        forDirectCount: Float
        directVotes: Float
        againstCount: Float
        indirectVotes: Float
        againstDirectCount: Float

        # Time Weight
        votersTimeWeight: Float
    }

    type YourQuestionStats {
        lastVoteByVoterYouFollowOn: String
        lastVoteByRepresentativeOn: String
        lastVoteByYouOn: String

        votersYouFollow: [Voter]
        votersRepresentingYou: [Voter]

        # Count
        votersYouFollowCount: Float
        votersRepresentingYouCount: Float

        # Time Weight
        votersYouFollowTimeWeight: Float
        votersRepresentingYouTimeWeight: Float
        votersYouFollowOrRepresentingYouTimeWeight: Float
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
        yourStatsUnseen: YourQuestionStats
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
            groupHandle: String,
            sortBy: String,
            createdByHandle: String,
            notUsers: Boolean
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