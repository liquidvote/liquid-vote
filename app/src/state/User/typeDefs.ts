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

export const USER_DIRECT_VOTES = gql`
  query($handle: String!) {
    UserDirectVotes(handle: $handle)
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