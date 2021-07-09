import { gql } from "apollo-server";

export const VoteTypeDefs = gql`

    type RepresentativeVote {
        # representativeId
        representativeHandle: String
        representativeAvatar: String
        representativeName: String
        position: String
        forWeight: Int
        againstWeight: Int

        createdOn: String
        lastEditOn: String
    }

    type Vote {
        questionText: String
        choiceText: String
        groupChannel: GroupChannel
        position: String
        forWeight: Int
        againstWeight: Int

        representatives: [RepresentativeVote]

        # createdBy
        # user
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