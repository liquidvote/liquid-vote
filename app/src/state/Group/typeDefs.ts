import { gql, useMutation } from '@apollo/client';

export const GROUP = gql`
  query($handle: String!) {
    Group(handle: $handle) {
        handle,
        name,
        bio,
        avatar,
        cover,
        externalLink,
        createdOn,
        lastEditOn,
        admins {
            name,
            avatar,
            handle
        }
        thisUserIsAdmin
        yourMemberRelation {
            createdOn
            lastEditOn
            isMember
            channels
        }
        privacy,
        channels {
            name,
            # purpose,
            # privacy,
            # createdOn,
            # lastEditOn,
            # members,
            # questions,
            # admins,
            # thisUserIsAdmin
        }
        stats {
            lastDirectVoteOn
            members
            questions
            representations
            directVotesMade
            indirectVotesMade
        }
        yourStats {
            lastDirectVoteOn
            representing
            representedBy
            directVotesMade
            indirectVotesMadeByYou
            indirectVotesMadeForYou
            directVotesInAgreement
            directVotesInDisagreement
        }
    }
  }
`;

export const GROUP_MEMBERS = gql`
  query($handle: String!) {
    GroupMembers(handle: $handle) {
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

export const GROUP_QUESTIONS = gql`
  query($handle: String!, $channels: [String]) {
    GroupQuestions(handle: $handle, channels: $channels) {
        questionText
        questionType
        startText
        choices
        groupChannel
        resultsOn

        createdOn
        lastEditOn
        thisUserIsAdmin
    }
  }
`;

export const EDIT_GROUP = gql`
  mutation ($handle: String!, $Group: JSON!) {
    editGroup(handle: $handle, Group: $Group)
  }
`;