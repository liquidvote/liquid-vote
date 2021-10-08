import { gql, useMutation } from '@apollo/client';

export const INVITES = gql`
  query(
      $groupHandle: String
      $invitedUserHandle: String
    ) {
        Invites(
            groupHandle: $groupHandle
            invitedUserHandle: $invitedUserHandle
        ) {
            toWhat {
                type
                group {
                    handle
                    name
                }
                question {
                    questionText
                }
                user {
                    ...user
                }
            }
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