import { gql, useMutation } from '@apollo/client';

export const USER = gql`
  query($handle: String!) {
    User(handle: $handle) {
        handle,
        name,
        bio,
        email,
        avatar,
        cover,
        location,
        externalLink,
        joinedOn,
        lastEditOn,
        isThisUser
        isRepresentingYou
        stats {
            lastDirectVoteOn
            representing
            representedBy
            groupsJoined
            directVotesMade
            indirectVotesMadeByUser
            indirectVotesMadeForUser
        }
        yourStats {
            votesInCommon
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
    }
  }
`;

export const SEARCH_USERS = gql`
  query($text: String!) {
    SearchUsers(text: $text) {
        handle,
        name,
        avatar
    }
  }
`;

export const USER_REPRESENTING = gql`
  query($handle: String!, $groupHandle: String) {
    UserRepresenting(handle: $handle, groupHandle: $groupHandle) {
        handle,
        name,
        bio,
        email,
        avatar,
        cover,
        location,
        externalLink,
        joinedOn,
        lastEditOn,
        isThisUser
        isRepresentingYou
        stats {
            lastDirectVoteOn
            representing
            representedBy
            groupsJoined
            directVotesMade
            indirectVotesMadeByUser
            indirectVotesMadeForUser
        }
        representationGroups {
            handle
            name
        }
    }
  }
`;

export const USER_REPRESENTED_BY = gql`
  query($handle: String!, $groupHandle: String) {
    UserRepresentedBy(handle: $handle, groupHandle: $groupHandle) {
        handle,
        name,
        bio,
        email,
        avatar,
        cover,
        location,
        externalLink,
        joinedOn,
        lastEditOn,
        isThisUser
        isRepresentingYou
        stats {
            lastDirectVoteOn
            representing
            representedBy
            groupsJoined
            directVotesMade
            indirectVotesMadeByUser
            indirectVotesMadeForUser
        }
        representationGroups {
            handle
            name
        }
    }
  }
`;

export const USER_GROUPS = gql`
  query($handle: String!, $representative: String) {
    UserGroups(handle: $handle, representative: $representative) {
        handle
        name
        bio
        avatar
        cover
        externalLink
        createdOn
        lastEditOn
        thisUserIsAdmin
        admins {
            name
            avatar
            handle
        }
        privacy,
        yourMemberRelation {
            createdOn
            lastEditOn
            isMember
            channels
        }
        representativeRelation {
            isRepresentingYou
            isGroupMember
            createdOn
            lastEditOn
        }
        stats {
            lastDirectVoteOn
            members
            questions
            representations
            directVotesMade
            indirectVotesMade
            mostRepresentingMembers {
                name
                avatar
                handle
            }
        }
    }
  }
`;

export const USER_VOTES = gql`
  query($handle: String!, $type: String) {
    UserVotes(handle: $handle, type: $type) {
        questionText
        # choiceText
        groupChannel {
            group
            channel
        }
        position
        isDirect
        forWeight
        againstWeight
        representatives{
            representativeHandle
            representativeAvatar
            representativeName
            position
            forWeight
            againstWeight
            createdOn
            lastEditOn
        }
        createdOn
        lastEditOn
        representeeVotes {
            isDirect
            position
            user {
                handle
                name
                avatar
            }
        }
        QuestionStats {
            lastVoteOn
            forCount
            forDirectCount
            forMostRepresentingVoters {
                handle
                avatar
                name
                representeeCount
            }
            againstCount
            againstMostRepresentingVoters {
                handle
                avatar
                name
                representeeCount
            }
            againstDirectCount
        }
        yourVote {
            position
            isDirect
            forWeight
            againstWeight
            representatives{
                representativeHandle
                representativeAvatar
                representativeName
                position
                forWeight
                againstWeight
                createdOn
                lastEditOn
            }
            createdOn
            lastEditOn
        }
    }
  }
`;

export const EDIT_USER = gql`
  mutation ($User: JSON!) {
    editUser(User: $User)
  }
`;

export const EDIT_GROUP_MEMBER_CHANNEL_RELATION = gql`
  mutation (
      $UserHandle: String!,
      $GroupHandle: String!,
      $Channels: [String]
      $IsMember: Boolean
    ) {
    editGroupMemberChannelRelation(
        UserHandle: $UserHandle,
        GroupHandle: $GroupHandle,
        Channels: $Channels
        IsMember: $IsMember
    ) {
        createdOn
        lastEditOn
        isMember
        channels
    }
  }
`;

export const EDIT_USER_REPRESENTATIVE_GROUP_RELATION = gql`
  mutation (
      $RepresenteeHandle: String!,
      $RepresentativeHandle: String!,
      $Group: String!,
      $IsRepresentingYou: Boolean!
    ) {
        editUserRepresentativeGroupRelation(
            RepresenteeHandle: $RepresenteeHandle,
            RepresentativeHandle: $RepresentativeHandle,
            Group: $Group,
            IsRepresentingYou: $IsRepresentingYou
        ) {
            isRepresentingYou
            createdOn
            lastEditOn
        }
  }
`;