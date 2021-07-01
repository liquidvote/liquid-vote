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
        # representing,
        # representedBy,
        # groups,
        # directVotes,
        isThisUser
    }
  }
`;

export const USER_REPRESENTING = gql`
  query($handle: String!) {
    UserRepresenting(handle: $handle) {
        handle,
        name,
        bio,
        avatar,
        location,
        externalLink,
        joinedOn,
        lastEditOn,
        representing,
        representedBy,
        groups,
        directVotes,
    }
  }
`;

export const USER_REPRESENTED = gql`
  query($handle: String!) {
    UserRepresented(handle: $handle) {
        handle,
        name,
        bio,
        avatar,
        location,
        externalLink,
        joinedOn,
        lastEditOn,
        representing,
        representedBy,
        groups,
        directVotes
    }
  }
`;

export const USER_DIRECT_VOTES = gql`
  query($handle: String!) {
    UserDirectVotes(handle: $handle)
  }
`;

export const USER_GROUPS = gql`
  query($handle: String!) {
    UserGroups(handle: $handle) {
        handle
        name
        bio
        avatar
        cover
        externalLink
        createdOn
        lastEditOn
        members
        questions
        thisUserIsAdmin
        admins {
            name
            avatar
            handle
        }
        privacy
    }
  }
`;

export const EDIT_USER = gql`
  mutation ($User: JSON!) {
    editUser(User: $User)
  }
`;

export const EDIT_GROUP_MEMBER_CHANNEL_RELATION = gql`
  mutation ($UserHandle: String!, $GroupHandle: String!, $Channels: [String]!) {
    editGroupMemberChannelRelation(UserHandle: $UserHandle, GroupHandle: $GroupHandle, Channels: $Channels)
  }
`;