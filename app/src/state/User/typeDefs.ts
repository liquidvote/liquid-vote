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
            yourVote {
                ...vote
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
        yourVote {
          ...vote
        }
        createdOn
        lastEditOn
        thisUserIsAdmin
        group {
            handle
            cover
            name
        }
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

    fragment vote on Vote {
        # _id
        questionText
        choiceText
        groupChannel {
            group
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
            questionText
            choiceText
            groupChannel {
                group
            }
            isDirect
            position
            user {
                handle
                name
                avatar
            }
        }
        user {
            handle
            name
            avatar
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