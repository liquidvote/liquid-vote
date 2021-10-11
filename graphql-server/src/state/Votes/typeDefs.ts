import { gql } from "apollo-server-lambda";

export const VoteTypeDefs = gql`

    type RepresentativeVote {
        # representativeId
        representativeHandle: String
        representativeAvatar: String
        representativeName: String
        position: String
        forWeight: Float
        againstWeight: Float

        createdOn: String
        lastEditOn: String
    }

    type Vote {
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
        choiceVotes: [Vote]

        # createdBy
        user: User
        createdOn: String
        lastEditOn: String
        thisUserIsAdmin: Boolean
        QuestionStats: QuestionStats
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
            groupHandle: String,
            userHandle: String,
            type: String,
            sortBy: String
        ):  [Vote]
    }

    extend type Mutation {
        editVote(
            questionText: String,
            choiceText: String,
            group: String,
            channel: String,
            Vote: JSON
        ): Vote
    }
`;