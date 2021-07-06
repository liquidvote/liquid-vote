import { gql } from "apollo-server";

export const InviteTypeDefs = gql`

    type Invite {
        toWhat: String # Group | Representation | Vote
        toWhom: String
        fromWhom: String
        isAccepted: Boolean
        Object: InviteObject

        createdOn: String
        lastEditOn: String
    }

    type InviteObject {
        id: String
        handle: String
        name: String
        avatar: String
    }

    extend type Query {
        Invite(handle: String): Invite
        Invites(
            groupHandle: String,
            inviterUserHandle: String,
            invitedUserHandle: String
        ): [Invite]
    }

    extend type Mutation {
        editInvite(Invite: JSON): Invite
    }
`;