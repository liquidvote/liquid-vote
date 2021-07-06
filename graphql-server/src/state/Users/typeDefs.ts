import { gql } from "apollo-server";

export const UserTypeDefs = gql`

    type User {
        handle: String
        name: String
        bio: String
        email: String
        avatar: String
        cover: String
        location: String
        externalLink: String
        joinedOn: String
        lastEditOn: String
        # representing: Int
        # representedBy: Int
        # groups: Int
        # directVotes: String
        isThisUser: Boolean
        isRepresentingYou: Int
        stats: UserStats
    }

    type UserStats {
        lastDirectVoteOn: String
        representing: Int
        representedBy: Int
        groupsJoined: Int
        directVotesMade: Int
        indirectVotesMade: Int
    }

    type UserRepresentativeGroupRelation {
        representativeId: String
        representeeId: String
        groupId: String
        channelNames: [String]
        isRepresentingYou: Boolean
        isGroupMember: Boolean
        createdOn: String
        lastEditOn: String
    }

    extend type Query {
        User(handle: String): User
        UserRepresenting(handle: String): [User]
        UserRepresented(handle: String): [User]
        UserDirectVotes(handle: String): JSON
        UserGroups(
            handle: String,
            representative: String
        ): [Group]
    }

    extend type Mutation {
        editUser(User: JSON): JSON
        editGroupMemberChannelRelation(
            UserHandle: String,
            GroupHandle: String,
            Channels: [String],
            IsMember: Boolean
        ): GroupMemberRelation
        editUserRepresentativeGroupRelation(
            RepresenteeHandle: String,
            RepresentativeHandle: String,
            Group: String,
            IsRepresentingYou: Boolean
        ): UserRepresentativeGroupRelation
    }
`;