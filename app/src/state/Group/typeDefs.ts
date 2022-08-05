import { gql, useMutation } from '@apollo/client';

export const GROUP = gql`
  query($handle: String!) {
    Group(handle: $handle) {
        handle,
        name,
        bio,
        avatar,
        cover,
        adminApproved,
        externalLink,
        createdOn,
        lastEditOn,
        admins {
            name,
            avatar,
            handle
        }
        allowRepresentation
        thisUserIsAdmin
        yourMemberRelation {
            groupId
            userId
            createdOn
            lastEditOn
            isMember
            channels
        }
        privacy,
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

export const GROUPS = gql`
  query {
    Groups {
        handle,
        name,
        bio,
        avatar,
        cover,
        adminApproved,
        externalLink,
        createdOn,
        lastEditOn,
        admins {
            name,
            avatar,
            handle
        }
        privacy,
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
        isFollowingYou
        isYouFollowing
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

export const ADMIN_APPROVE_GROUP = gql`
  mutation ($handle: String!, $newStatus: Boolean!) {
    adminApproveGroup(handle: $handle, newStatus: $newStatus)
  }
`;