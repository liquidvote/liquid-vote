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
        members,
        questions,
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
    }
  }
`;

export const GROUP_MEMBERS = gql`
  query($handle: String!) {
    GroupMembers(handle: $handle)
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