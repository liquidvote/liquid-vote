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
        admins: [User]
        channels: [Channel]
        thisUserIsAdmin: Boolean
        userMemberRelation: GroupMemberRelation
        yourMemberRelation: GroupMemberRelation
        representativeRelation: UserRepresentativeGroupRelation
        stats: GroupStats
        yourStats: yourGroupStats
    }

    type GroupStats {
        lastDirectVoteOn: String
        members: Int
        questions: Int
        representations: Int
        directVotesMade: Int
        indirectVotesMade: Int
        mostRepresentingMembers: [User]
    }

    type yourGroupStats {
        lastDirectVoteOn: String
        representing: Int
        representedBy: Int
        directVotesMade: Int
        directVotesInAgreement: Int
        directVotesInDisagreement: Int
        indirectVotesMadeByYou: Int
        indirectVotesMadeForYou: Int
    }

    type Channel {
        name: String
        # purpose: String
        # privacy: String
        # createdOn: String
        # lastEditOn: String
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
        createdOn: String
        lastEditOn: String
        isMember: Boolean
        channels: [String]
    }

    extend type Query {
        Group(handle: String): Group
        Groups(userHandle: String): [Group]
        GroupMembers(handle: String): [User]
        GroupQuestions(handle: String, channels: [String]): [Question]
    }

    extend type Mutation {
        editGroup(handle: String, Group: JSON): JSON
    }
`;