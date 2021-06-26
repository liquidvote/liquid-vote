import { gql } from "apollo-server";

export const VoteTypeDefs = gql`

    type Vote {
        questionText: String
        choiceText: String
        groupChannel: JSON
        position: String

        createdOn: String
        lastEditOn: String
        thisUserIsAdmin: Boolean
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
        ): JSON
    }
`;