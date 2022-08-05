import { gql } from "apollo-server-lambda";

export const GroupTypeDefs = gql`

    type GroupStats {
        lastDirectVoteOn: String
        members: Int
        questions: Int
        representations: Int
        
        directVotesMade: Int
        indirectVotesMade: Int
        mostRepresentingMembers: [User]
    }

    type YourGroupStats {
        lastDirectVoteOn: String
        representing: Int
        representedBy: Int
        directVotesMade: Int
        
        directVotesInAgreement: Int         # hum, this isn't useful
        directVotesInDisagreement: Int      # hum, this isn't useful
        indirectVotesMadeByYou: Int
        indirectVotesMadeForYou: Int

        membersYouFollow: [User]
    }

    type Group {
        handle: String
        name: String
        bio: String
        avatar: String
        privacy: String
        adminApproved: Boolean
        allowRepresentation: Boolean
        cover: String
        externalLink: String
        createdOn: String
        lastEditOn: String
        admins: [User]
        channels: [Channel]
        thisUserIsAdmin: Boolean
        userMemberRelation: GroupMemberRelation
        yourMemberRelation: GroupMemberRelation
        representativeRelation: UserRepresentativeGroupRelation # him to you
        youToHimRepresentativeRelation: UserRepresentativeGroupRelation
        stats: GroupStats
        yourStats: YourGroupStats
        userStats: UserStats
        yourUserStats: YourUserStats
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
        visibility: String
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
        adminApproveGroup(handle: String, newStatus: Boolean): JSON
    }
`;