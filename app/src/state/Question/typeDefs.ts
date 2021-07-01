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

export const QUESTIONS = gql`
  query($group: String!, $channels: [String]) {
    Questions(group: $group, channels: $channels) {
        questionText
        questionType
        startText
        choices {
            text
            stats {
                ...stats
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
        createdOn
        lastEditOn
        thisUserIsAdmin
    }
  }

  fragment stats on QuestionStats {
		lastVoteOn
        forCount
        forDirectCount
        forMostRelevantVoters
        againstCount
        againstMostRelevantVoters
        againstDirectCount
        userVote {
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