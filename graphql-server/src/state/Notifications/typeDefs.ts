import { gql } from "apollo-server-lambda";

export const NotificationTypeDefs = gql`

    type Notification {
        _id: ID!
        type: String

            # voted_on_a_poll_you_voted ✅
                # actionUser
                # poll

            # followed_you ✅
                # actionUser

            # voted_on_a_poll - if you created poll | if you invited to vote ✅
                # actionUser
                # poll

            # invited_you_to_vote_on_a_poll 🏗
                # actionUser
                # poll

            # invited_you_to_vote_on_group 🏗
                #actionUser
                #group

            # invited_you_to_vote_on_profile 🏗
                #actionUser
                #user

        seen: Boolean
        inviteSent: Boolean
        inviteAcceptedOn: String    # group | yourProfile
        
        toUser: User # Id
        inviterUser: User # Id
        inviteLink: String

        actionUser: User # Id
        question: Question  # Id
        choiceText: String
        group: Group # Id
        user: User # Id
        agreesWithYou: Boolean
        lastEditOn: String
    }

    extend type Query {
        YourNotifications: [Notification]
        InvitationsSentAndThatCouldBeSent(
            type: String
            questionText: String
            choiceText: String
            groupHandle: String
            userHandle: String
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
        sendInviteNotification(
            type: String
            toUserHandle: String
            questionText: String
            groupHandle: String,
            userHandle: String
            inviteLink: String
        ): Notification
    }
`;
