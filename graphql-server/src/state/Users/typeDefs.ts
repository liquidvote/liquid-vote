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
        representing: Int
        representedBy: Int
        groups: Int
        directVotes: String
        isThisUser: Boolean
    }

    extend type Query {
        User(handle: String): User
        UserRepresenting(handle: String): [User]
        UserRepresented(handle: String): [User]
        UserDirectVotes(handle: String): JSON
        UserGroups(handle: String): [Group]
    }

    extend type Mutation {
        editUser(User: JSON): JSON
        editGroupMemberChannelRelation(UserHandle: String, GroupHandle: String, Channels: [String] ): JSON
    }
`;