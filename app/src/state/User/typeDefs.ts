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
  query($text: String!, $notInGroup: String, $inGroup: String) {
    SearchUsers(text: $text, notInGroup: $notInGroup, inGroup: $inGroup) {
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
            groupId
            userId
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
  query($handle: String!, $representative: String, $notUsers: Boolean) {
    UserGroups(handle: $handle, representative: $representative, notUsers: $notUsers) {
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
            groupId
            userId
            createdOn
            lastEditOn
            isMember
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

export const USER_QUESTIONS = gql`
  query($handle: String, $sortBy: String, $notUsers: Boolean) {
    UserQuestions(handle: $handle, sortBy: $sortBy, notUsers: $notUsers) {
        questionText
        questionType
        startText
        choices {
            text
            stats {
                ...stats
            }
            userVote {
                questionText
                position
                representatives {
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
        groupChannel {
            group
            channel
        }
        resultsOn

        stats {
            ...stats
        }
        userVote {
          questionText
          position
          representatives {
            representativeHandle
            representativeAvatar
            representativeName
            position

            createdOn
            lastEditOn
          }
          
          createdOn
          lastEditOn
        }
        createdOn
        lastEditOn
        thisUserIsAdmin
    }
  }

  fragment stats on QuestionStats {
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
        directVotes
        indirectVotes
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
      $IsMember: Boolean
    ) {
    editGroupMemberChannelRelation(
        UserHandle: $UserHandle,
        GroupHandle: $GroupHandle,
        Channels: $Channels,
        IsMember: $IsMember
    ) {
        groupId
        userId
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
            representativeId
            representeeId
            groupId
            isRepresentingYou
            createdOn
            lastEditOn
        }
  }
`;