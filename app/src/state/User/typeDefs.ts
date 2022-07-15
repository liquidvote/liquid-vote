import { gql, useMutation } from '@apollo/client';

export const USER = gql`
  query($handle: String!, $groupHandle: String) {
    User(handle: $handle, groupHandle: $groupHandle) {
        id
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
        isFollowingYou
        isYouFollowing
        stats {
            id
            lastDirectVoteOn
            representing
            representedBy
            groupsJoined
            directVotesMade
            indirectVotesMadeByUser
            indirectVotesMadeForUser
            pollsCreated
            following
            followedBy
        }
        yourStats {
            id
            votesInCommon
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
        groupStats {
          stats {
            lastDirectVoteOn
            representing
            representedBy
            directVotesMade
            indirectVotesMadeByUser
            indirectVotesMadeForUser
            pollsCreated
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
  }
`;

export const SEARCH_USERS = gql`
  query($text: String!, $notInGroup: String, $inGroup: String) {
    SearchUsers(text: $text, notInGroup: $notInGroup, inGroup: $inGroup) {
        handle,
        name,
        avatar
    }
  }
`;

export const USER_FOLLOWING = gql`
  query($handle: String!) {
    UserFollowing(handle: $handle) {
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


export const USER_FOLLOWED_BY = gql`
  query($handle: String!) {
    UserFollowedBy(handle: $handle) {
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
  query($handle: String!, $groupHandle: String, $representativeHandle: String) {
    UserRepresentedBy(handle: $handle, groupHandle: $groupHandle, representativeHandle: $representativeHandle) {
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
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
        representationGroups {
            handle
            name
        }
    }
  }
`;

export const USER_GROUPS = gql`
  query($handle: String, $representative: String, $notUsers: Boolean) {
    UserGroups(handle: $handle, representative: $representative, notUsers: $notUsers) {
        handle
        name
        bio
        avatar
        cover
        privacy
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
            groupId
            userId
            createdOn
            lastEditOn
            isMember
            visibility
            channels
        }
        representativeRelation {
            representativeId
            representeeId
            groupId
            isRepresentingYou
            isGroupMember
            createdOn
            lastEditOn
        }
        youToHimRepresentativeRelation {
            representativeId
            representeeId
            groupId
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
                yourStats {
                  directVotesInCommon
                  directVotesInAgreement
                  directVotesInDisagreement
                  indirectVotesMadeByYou
                  indirectVotesMadeForYou
                }
                stats {
                    directVotesMade
                }
            }
        }
        userStats {
            representing
            representedBy
            directVotesMade
            indirectVotesMadeForUser
        }
        yourUserStats {
            votesInCommon
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
        yourStats {
            membersYouFollow {
                name
                avatar
                handle
                yourStats {
                  directVotesInCommon
                  directVotesInAgreement
                  directVotesInDisagreement
                  indirectVotesMadeByYou
                  indirectVotesMadeForYou
                }
                stats {
                    directVotesMade
                }
            }
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
      $Channels: [String],
      $IsMember: Boolean,
      $Visibility: String
    ) {
    editGroupMemberChannelRelation(
        UserHandle: $UserHandle,
        GroupHandle: $GroupHandle,
        Channels: $Channels,
        IsMember: $IsMember,
        Visibility: $Visibility
    ) {
        groupId
        userId
        createdOn
        lastEditOn
        isMember
        visibility
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
            representativeId
            representeeId
            groupId
            isRepresentingYou
            createdOn
            lastEditOn
        }
  }
`;

export const EDIT_USER_FOLLOWING_RELATION = gql`
  mutation (
      $FollowedHandle: String!,
      $FollowingHandle: String!,
      $IsFollowing: Boolean!
    ) {
        editUserFollowingRelation(
            FollowedHandle: $FollowedHandle,
            FollowingHandle: $FollowingHandle,
            IsFollowing: $IsFollowing
        ) {
            id
            followedId
            followingId
            isFollowing
            createdOn
            lastEditOn
        }
  }
`;