import { gql, useMutation } from '@apollo/client';

export const QUESTION = gql`
  query(
      $questionText: String!,
      $group: String!,
      $channel: String!
    ) {
        Question(
            questionText: $questionText,
            group: $group,
            channel: $channel
        ) {
            questionText
            questionType
            startText
            # choices
            groupChannel{
                group
                channel
            }
            resultsOn
            createdOn
            lastEditOn
            thisUserIsAdmin
            stats {
                lastVoteOn
                forCount
                forDirectCount
                forMostRepresentedVoters
                againstCount
                againstMostRepresentedVoters
                againstDirectCount
            }
            userVote {
                position
                representatives {
                    representativeHandle
                }
            }
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
        groupChannel {
            group
            channel
        }
        resultsOn

        stats {
            ...stats
        }
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
        createdOn
        lastEditOn
        thisUserIsAdmin
    }
  }

  fragment stats on QuestionStats {
		lastVoteOn
        forCount
        forDirectCount
        forMostRepresentedVoters
        againstCount
        againstMostRepresentedVoters
        againstDirectCount
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