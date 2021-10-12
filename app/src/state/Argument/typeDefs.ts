import { gql, useMutation } from '@apollo/client';

export const ARGUMENT = gql`
  query($questionText: String, $groupHandle: String, $userHandle: String) {
    Argument(questionText: $questionText, groupHandle: $groupHandle, userHandle: $userHandle) {
        argumentText,
        stats {
            votes
        },
        yourUpVote,
        question {
            questionText
            groupChannel {
                group
            }
        }
        user {
            name
            handle
            avatar
        }
        group {
            name
            handle
        }
        createdOn,
        lastEditOn
    }
  }
`;

export const ARGUMENTS = gql`
  query($questionText: String, $groupHandle: String, $userHandle: String, $sortBy: String) {
    Arguments(questionText: $questionText, groupHandle: $groupHandle, userHandle: $userHandle, sortBy: $sortBy) {
        argumentText,
        stats {
            votes
        },
        yourUpVote,
        question {
            questionText
            groupChannel {
                group
            }
        }
        user {
            name
            handle
            avatar
        }
        group {
            name
            handle
        }
        createdOn,
        lastEditOn
    }
  }
`;

export const EDIT_ARGUMENT = gql`
    mutation (
      $questionText: String!,
      $groupHandle: String,
      $userHandle: String,
      $ArgumentEdits: JSON!
    ) {
        editArgument(
            questionText: $questionText,
            groupHandle: $groupHandle,
            userHandle: $userHandle,
            ArgumentEdits: $ArgumentEdits
        ) {
            argumentText,
    
            createdOn,
            lastEditOn
        }
    }
`;