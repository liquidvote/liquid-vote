import { gql } from "apollo-server-lambda";

export const TagTypeDefs = gql`

    type TagStats {
        lastDirectVoteOn: String
        # members: Int
        representatives: Int
        questions: Int
        representations: Int
        
        directVotesMade: Int
        indirectVotesMade: Int
        mostRepresentingUsers: [User]
    }

    type yourTagStats {
        lastDirectVoteOn: String
        representing: Int
        representedBy: Int
        directVotesMade: Int
        
        directVotesInAgreement: Int
        directVotesInDisagreement: Int
        indirectVotesMadeByYou: Int
        indirectVotesMadeForYou: Int
    }

    type Tag {
        name: String
        createdOn: String
        lastEditOn: String
        userRelation: TagRelation
        yourRelation: TagRelation
        representativeRelation: UserRepresentativeTagRelation
        stats: TagStats
        yourStats: yourTagStats
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