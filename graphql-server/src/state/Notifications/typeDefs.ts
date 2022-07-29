import { gql } from "apollo-server-lambda";

export const NotificationTypeDefs = gql`

    type Notification {
        _id: ID!
        type: String
        seen: Boolean

            # Following_voted_on_a_poll_you_voted
                # actionUser
                # poll

            # Someone_followed_you
                # actionUser
         
            # Following_invited_you_to_vote_on_a_poll
                # actionUser
                # poll

            # Someone_voted_on_a_poll_you_created
                # actionUser
                # poll
        
        toUser: User # Id

        actionUser: User # Id
        poll: Question  # Id

    }

    extend type Query {
        Notifications: [Notification]
    }

    extend type Mutation {
        markNotificationRead(
            id: String
        ): JSON
        sendTestNotification(
            type: String
            toUserHandle: String
            actionUserHandle: String
            pollId: String
        ): JSON
    }
`;
