import { gql } from "apollo-server";

export const InviteTypeDefs = gql`

    type Invite {
        toWhat: String # Group | Representation | Vote | GroupAdmin
        toWhom: ToWhom
        fromWhom: User
        isAccepted: Boolean
        group: Group
        question: Question
        status: String # sent | accepted | canceled

        lastSentOn: String
        createdOn: String
        lastEditOn: String
    }

    type ToWhom {
        user: User
        email: String 
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