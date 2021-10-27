import { gql, useMutation } from '@apollo/client';

export const VOTE = gql`
  query($handle: String!) {
    Vote(handle: $handle) {
        # _id
        questionType
        voteText
        startText
        choices
        groupChannel {
            group
        }
        resultsOn
        createdOn,
        lastEditOn,
        user {
            handle
        }
    }
  }
`;

export const VOTES = gql`
  query($questionText: String, $choiceText: String, $groupHandle: String, $userHandle: String, $type: String, $sortBy: String) {
    Votes(questionText: $questionText, choiceText: $choiceText,, groupHandle: $groupHandle, userHandle: $userHandle, type: $type, sortBy: $sortBy) {
        ...vote
        # choiceVotes {
        #     ...vote
        # }
        question {
            _id
            questionText
            questionType
            choices {
                text
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
                    directVotes
                    indirectVotes
                }
                userVote {
                    ...vote
                }
                yourVote {
                    ...vote
                }
            }
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
                directVotes
                indirectVotes
            }
            userVote {
                ...vote
            }
            yourVote {
                ...vote
            }
        }
        user {
            name
            handle
            avatar
        }
    }
  }

  fragment vote on Vote {
    # _id
    questionText
    choiceText
    groupChannel {
        group
    }
    position
    isDirect
    forWeight
    againstWeight
    representatives{
        representativeHandle
        representativeAvatar
        representativeName
        position
        forWeight
        againstWeight
        createdOn
        lastEditOn
    }
    createdOn
    lastEditOn
    representeeVotes {
        # _id
        questionText
        choiceText
        groupChannel {
            group
        }
        isDirect
        position
        user {
            handle
            name
            avatar
        }
    }
    user {
        handle
        name
        avatar
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
            # _id
            questionText
            choiceText
            groupChannel {
                group
            }
            user {
                handle
                name
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