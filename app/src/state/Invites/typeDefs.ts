import { gql, useMutation } from '@apollo/client';

export const INVITES = gql`
  query(
      $groupHandle: String
      $inviterUserHandle: String
      $invitedUserHandle: String
    ) {
        Invites(
            groupHandle: $groupHandle
            inviterUserHandle: $inviterUserHandle
            invitedUserHandle: $invitedUserHandle
        ) {
            toWhat
            toWhom {
                user {
                    ...user
                }
                email
            }
            fromWhom {
                ...user
            }
            isAccepted
            group {
                handle
                name
            }
            question {
                questionText
            }
            status
            lastSentOn
            createdOn
            lastEditOn
        }
    }
    fragment user on User {
        avatar
        handle
        name
    }
`;

export const EDIT_INVITE = gql`
  mutation ($Invite: JSON!) {
    editInvite(Invite: $Invite) {
        status
    }
  }
`;