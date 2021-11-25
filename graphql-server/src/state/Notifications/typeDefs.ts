import { gql } from "apollo-server-lambda";

export const NotificationTypeDefs = gql`

    type Notification {
        _id: ID!
        type: String

            # YOU
            # new like          on argument         to arguer
            # new vote          on poll             to poller           and admins      and other pollers*
            # new option        on poll             to poller           and admins      and other pollers*
            # new argument      on poll             to poller           and admins      and other pollers*
            # new representee   on group OR tag     to representative
            # new member        on group            to inviter          and admins
            # new poll          on group            to admin

            # * if other poller has had no notifications for 24h



            # REPRESENTATIVES
            # these can be got by querying indirect votes
            # (if we forego or alternate on marking them as seen)

            # SYSTEM
            # welcome!
            # member of one group! Check these others...
            # why no representatives on [Group] yet?
        
        user: User # Id
    }

    type NotificationData {
        data: NotificationData
        group: Group
        question: Question
        choice: String
        users: [User]
        votes: [Votes]
        argument: Argument
    }

    extend type Query {
        Notification(
            questionText: String,
            group: String,
            channel: String
        ): Question
        Notifications(
            group: String,
            sortBy: String
        ): [Question]
    }

    extend type Mutation {
        markNotificationRead(
            id: String
        ): JSON
    }
`;