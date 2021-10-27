import { gql, useMutation } from '@apollo/client';

export const QUESTION = gql`
  query(
      $questionText: String!,
      $group: String!,
    ) {
        Question(
            questionText: $questionText,
            group: $group,
        ) {
            _id
            questionText
            questionType
            startText
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
                yourVote {
                    ...vote
                }
            }
            groupChannel{
                group
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
            yourVote {
                ...vote
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

export const QUESTIONS = gql`
    query($group: String!, $sortBy: String) {
        Questions(group: $group, sortBy: $sortBy) {
            _id
            questionText
            questionType
            startText
            choices {
                text
                stats {
                    ...stats
                }
                yourVote {
                    ...vote
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
            yourVote {
                ...vote
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
        directVotes
        indirectVotes
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