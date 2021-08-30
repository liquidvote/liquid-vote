import { gql } from "apollo-server";

export const UserTypeDefs = gql`

    type UserStats {
        lastDirectVoteOn: String
        representing: Int                       # inUse
        representedBy: Int                      # inUse
        groupsJoined: Int
        directVotesMade: Int                    # inUse
        indirectVotesMadeByUser: Int            
        indirectVotesMadeForUser: Int           # inUse
    }

    type YourUserStats {
        # groupsInCommon: Int
        votesInCommon: Int
        directVotesInCommon: Int
        votesInAgreement: Int                   
        votesInDisagreement: Int
        
        directVotesInAgreement: Int             # inUse
        directVotesInDisagreement: Int          # inUse
        indirectVotesMadeByYou: Int             # inUse
        indirectVotesMadeForYou: Int            # inUse
    }

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
        isThisUser: Boolean
        isRepresentingYou: Int
        stats: UserStats
        yourStats:  YourUserStats

        representationGroups: [Group]
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
        SearchUsers(
            text: String,
            notInGroup: String,
            inGroup: String,
            notSelf: Boolean
        ): [User]
        UserRepresenting(handle: String, groupHandle: String): [User] # Users that this user is representing
        UserRepresentedBy(handle: String, groupHandle: String): [User] # Users that this user is represented by
        UserGroups(
            handle: String,
            representative: String
        ): [Group],
        UserVotes(
            handle: String,
            type: String
        ):  [Vote]
        # UserRelatedUsers(groupHandle: String) : [User]
    }

    extend type Mutation {
        editUser(User: JSON): JSON
        editGroupMemberChannelRelation(
            UserHandle: String,
            GroupHandle: String,
            Channels: [String],
            IsMember: Boolean,
            InviteId: String
        ): GroupMemberRelation
        editUserRepresentativeGroupRelation(
            RepresenteeHandle: String,
            RepresentativeHandle: String,
            Group: String,
            IsRepresentingYou: Boolean
        ): UserRepresentativeGroupRelation
    }
`;