import { gql } from "apollo-server";

export const GroupTypeDefs = gql`

    type Group {
        handle: String
        name: String
        bio: String
        avatar: String
        privacy: String
        cover: String
        externalLink: String
        createdOn: String
        lastEditOn: String
        members: Int
        questions: Int
        admins: [User]
        channels: [Channel]
        thisUserIsAdmin: Boolean
        memberRelation: JSON
    }

    type Channel {
        name: String
        # purpose: String
        # privacy: String
        # createdOn: String
        # lastEditOn: String
        # members: Int
        # questions: Int
        # admins: [User]
        # thisUserIsAdmin: Boolean
    }

    # relation
    type GroupChannel {
        channel: String
        group: String
    }

    type GroupMemberRelation {
        groupId: String
        userId: String
        joinedOn: String
        lastEditOn: String
        isMember: Boolean
        channels: [GroupMemberChannelRelation]
    }

    type GroupMemberChannelRelation {
        channelName: String
        # joinedOn: String
        # lastEditOn: String
        # isMember: Boolean
    }

    extend type Query {
        Group(handle: String): Group
        # UserGroups(handle: String): [Group]
        GroupMembers(handle: String): [User]
        GroupQuestions(handle: String, channels: [String]): [Question]
    }

    extend type Mutation {
        editGroup(handle: String, Group: JSON): JSON
        editGroupChannel(handle: String, Channel: JSON): JSON
    }
`;