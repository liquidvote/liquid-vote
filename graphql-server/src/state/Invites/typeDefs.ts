import { gql } from "apollo-server";

export const InviteTypeDefs = gql`

    type Invite {
        toWhat: ToWhat
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

    type ToWhat {
        type: String # group | representation | vote | groupAdmin
        group: Group
        question: Question
        user: User
    }

    type ToWhom {
        user: User
        email: String 
    }

    extend type Query {
        Invite(handle: String): Invite
        Invites(
            groupHandle: String,
            invitedUserHandle: String
        ): [Invite]
    }

    extend type Mutation {
        editInvite(Invite: JSON): Invite
    }
`;