import { gql } from "apollo-server-lambda";

export const NotificationTypeDefs = gql`

    type Notification {
        _id: ID!
        type: String

            # voted_on_a_poll_you_voted
                # actionUser
                # poll

            # followed_you ✅
                # actionUser
         
            # invited_you_to_vote_on_a_poll
                # actionUser
                # poll

            # voted_on_a_poll
                # actionUser
                # poll

            # invited_you_to_join_group
                #actionUser
                #group

        seen: Boolean
        
        toUser: User # Id

        actionUser: User # Id
        question: Question  # Id
        choiceText: String
        group: Group # Id
        agreesWithYou: Boolean
        lastEditOn: String
    }

    extend type Query {
        YourNotifications: [Notification]
        InvitationsSentAndThatCouldBeSent(
            type: String
            question: String
            actionUserHandle: String
            group: String
        ): [Notification]
    }

    extend type Mutation {
        markUnseenNotificationsAsSeen: JSON
        sendTestNotification(
            type: String
            toUserHandle: String
            actionUserHandle: String
            questionText: String
            choiceText: String
            groupHandle: String
            agreesWithYou: Boolean
        ): JSON
    }
`;
