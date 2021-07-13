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
                forMostRepresentingVoters {
                    handle
                    avatar
                    name
                    representeeCount
                }
                againstCount
                againstMostRepresentingVoters {
                    handle
                    avatar
                    name
                    representeeCount
                }
                againstDirectCount
            }
            userVote {
                position
                forWeight
                againstWeight
                representatives {
                    representativeHandle
                    representativeAvatar
                    representativeName
                }
                representeeVotes {
                    isDirect
                    position
                    user {
                        handle
                        name
                    }
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
        forMostRepresentingVoters {
            handle
            avatar
            name
            representeeCount
        }
        againstCount
        againstMostRepresentingVoters {
            handle
            avatar
            name
            representeeCount
        }
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