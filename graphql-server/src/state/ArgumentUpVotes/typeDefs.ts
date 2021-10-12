import { gql } from "apollo-server-lambda";

export const ArgumentUpVotesTypeDefs = gql`
    type ArgumentUpVote {
        voted: Boolean

        argument: Argument
        user: User
        createdOn: String
        lastEditOn: String
    }

    extend type Query {
        ArgumentUpVote(
            questionText: String,
            groupHandle: String,
            userHandle: String
        ): ArgumentUpVote
    }

    extend type Mutation {
        editArgumentUpVote(
            voted: Boolean,
            questionText: String,
            groupHandle: String,
            userHandle: String
        ): ArgumentUpVote
    }
`;