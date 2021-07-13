import { gql, useMutation } from '@apollo/client';

export const VOTE = gql`
  query($handle: String!) {
    Vote(handle: $handle) {
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

export const EDIT_VOTE = gql`
    mutation (
      $questionText: String!,
      $choiceText: String,
      $group: String,
      $channel: String,
      $Vote: JSON!
    ) {
        editVote(
            questionText: $questionText,
            choiceText: $choiceText,
            group: $group,
            channel: $channel,
            Vote: $Vote
        ) {
            questionText
            choiceText
            groupChannel {
                group
                channel
            }
            position
            representatives {
                representativeHandle
                representativeAvatar
                representativeName
                position
                createdOn
                lastEditOn
            }
            representeeVotes {
                isDirect
                user {
                    handle
                    name
                }
            }
            createdOn
            lastEditOn
            thisUserIsAdmin
            QuestionStats {
                ...stats
            }
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