import { gql, useMutation } from '@apollo/client';

export const QUESTION = gql`
  query($handle: String!) {
    Question(handle: $handle) {
        questionType
        voteText
        startText
        choices
        groupChannel
        resultsOn
        createdOn,
        lastEditOn,
    }
  }
`;

export const EDIT_QUESTION = gql`
  mutation (
      $questionText: String!,
      $group: String,
      $channel: String,
      $Question: JSON!
    ) {
        editQuestion(
            questionText: $questionText,
            group: $group,
            channel: $channel,
            Question: $Question
        )
    }
`;