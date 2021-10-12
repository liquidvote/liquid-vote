import { gql, useMutation } from '@apollo/client';

export const EDIT_ARGUMENT_UP_VOTE = gql`
    mutation (
      $questionText: String!,
      $groupHandle: String,
      $userHandle: String,
      $voted: Boolean!
    ) {
        editArgumentUpVote(
            questionText: $questionText,
            groupHandle: $groupHandle,
            userHandle: $userHandle,
            voted: $voted
        ) {
            voted,
            argument {
                argumentText,
                stats {
                    votes
                }
            }
    
            createdOn,
            lastEditOn
        }
    }

`;