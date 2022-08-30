import { gql } from "apollo-server-lambda";

export const VoteTypeDefs = gql`

    type RepresentativeVote {
        # representativeId
        handle: String
        avatar: String
        name: String
        representativeHandle: String
        representativeAvatar: String
        representativeName: String
        position: String
        forWeight: Float
        againstWeight: Float

        stats: UserStats
        yourStats:  YourUserStats

        createdOn: String
        lastEditOn: String
    }

    type Vote {
        # _id: ID!
        questionText: String
        choiceText: String
        groupChannel: GroupChannel
        position: String
        isDirect: Boolean
        forWeight: Float
        againstWeight: Float

        representatives: [RepresentativeVote]
        representeeVotes: [Vote]
        representeeCount: Int
        yourVote: Vote
        # choiceVotes: [Vote]

        # createdBy
        user: User
        createdOn: String
        daysAgo: Float
        inverseDaysAgo: Float
        lastEditOn: String
        thisUserIsAdmin: Boolean
        QuestionStats: QuestionStats
        question: Question
    }

    extend type Query {
        Vote(
            questionText: String,
            choiceText: String,
            group: String,
            channel: String
        ): Vote
        Votes(
            questionText: String,
            choiceText: String,
            groupHandle: String,
            userHandle: String,
            followsOnly: Boolean
            type: String,
            sortBy: String
        ):  [Vote]
        VotesTest(args: JSON): JSON
    }

    extend type Mutation {
        editVote(
            questionText: String,
            choiceText: String,
            group: String,
            channel: String,
            Vote: JSON,
            inviterHandle: String
        ): Vote
    }
`;