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

export const VOTES = gql`
  query($questionText: String, $groupHandle: String, $userHandle: String, $type: String, $sortBy: String) {
    Votes(questionText: $questionText, groupHandle: $groupHandle, userHandle: $userHandle, type: $type, sortBy: $sortBy) {
        ...voteMain
        choiceVotes {
            ...voteMain
        }
        question {
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
                    questionText
                    position
                    forWeight
                    againstWeight
                    representatives {
                        representativeHandle
                        representativeAvatar
                        representativeName
                        position
                        forWeight
                        againstWeight
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
                questionText
                position
                forWeight
                againstWeight
                representatives {
                    representativeHandle
                    representativeAvatar
                    representativeName
                    position
                    forWeight
                    againstWeight
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
        user {
            name
            handle
            avatar
        }
    }
  }

  fragment voteMain on Vote {
    questionText
    choiceText
    groupChannel {
        group
        channel
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
        isDirect
        position
        user {
            handle
            name
            avatar
        }
    }
    yourVote {
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