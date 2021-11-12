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
        # representativeRelation: UserRepresentativeTagRelation
        stats: TagStats
        yourStats: yourTagStats
    }

    type TagRelation {
        tagId: String
        userId: String
        isFollowing: Boolean
        createdOn: String
        lastEditOn: String
    }

    extend type Query {
        Tag(handle: String): Tag
        Tags(userHandle: String): [Tag]
        # TagRepresentatives(handle: String): [User]
        TagQuestions(handle: String, channels: [String]): [Question]
    }

    extend type Mutation {
        editTag(name: String, Tag: JSON): JSON
    }
`;