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
            description
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
                yourStats {
                    votersYouFollowCount
                    votersRepresentingYouCount
                    usersYouAreRepresentingCount
                    votersYouFollowTimeWeight
                    votersRepresentingYouTimeWeight
                    votersYouFollow {
                        ...voter
                    }
                    votersRepresentingYou{
                        ...voter
                    }
                }
            }
            allowNewChoices
            groupChannel{
                group
            }
            resultsOn
            createdOn
            lastEditOn
            thisUserIsAdmin
            group {
                handle
                cover
                name
                allowRepresentation
            }
            stats {
                lastVoteOn
                forCount
                forDirectCount
                forMostRepresentingVoters {
                    handle
                    avatar
                    name
                    representeeCount
                    stats{
                        directVotesMade
                    }
                    yourStats {
                        directVotesInCommon
                        directVotesInAgreement
                        directVotesInDisagreement
                        indirectVotesMadeByYou
                        indirectVotesMadeForYou
                    }
                }
                againstCount
                againstMostRepresentingVoters {
                    handle
                    avatar
                    name
                    representeeCount
                    stats{
                        directVotesMade
                    }
                    yourStats {
                        directVotesInCommon
                        directVotesInAgreement
                        directVotesInDisagreement
                        indirectVotesMadeByYou
                        indirectVotesMadeForYou
                    }
                }
                againstDirectCount
                directVotes
                indirectVotes
            }
            yourVote {
                ...vote
            }
            yourStats {
                votersYouFollowCount
                votersRepresentingYouCount
                usersYouAreRepresentingCount
                votersYouFollowTimeWeight
                votersRepresentingYouTimeWeight
                votersYouFollow {
                    ...voter
                }
                votersRepresentingYou{
                    ...voter
                }
            }
            createdBy {
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
            stats{
                directVotesMade
            }
            yourStats {
                directVotesInCommon
                directVotesInAgreement
                directVotesInDisagreement
                indirectVotesMadeByYou
                indirectVotesMadeForYou
			}
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

    fragment voter on Voter {
        handle
        avatar
        name
        stats {
            directVotesMade
        }
        yourStats {
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
        vote {
            position
            daysAgo
            inverseDaysAgo
        }
    }

`;

export const QUESTIONS = gql`
    query(
        $groupHandle: String,
        $sortBy: String,
        $createdByHandle: String,
        $notUsers: Boolean
    ) {
        Questions(
            groupHandle: $groupHandle,
            sortBy: $sortBy,
            createdByHandle: $createdByHandle,
            notUsers: $notUsers
        ) {
            _id
            questionText
            description
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
                yourStats {
                  usersYouAreRepresentingCount
                  votersYouFollow {
                    handle
                    avatar
                    name
                    stats {
                      directVotesMade
                    }
                    yourStats {
                      directVotesInCommon
                      directVotesInAgreement
                      directVotesInDisagreement
                      indirectVotesMadeByYou
                      indirectVotesMadeForYou
                    }
                    vote {
                      position
                    }
                  }
                }
            }
            allowNewChoices
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
            yourStats {
                votersYouFollowCount
                votersRepresentingYouCount
                usersYouAreRepresentingCount
                votersYouFollowTimeWeight
                votersRepresentingYouTimeWeight
                votersYouFollow {
                    ...voter
                }
                votersRepresentingYou{
                    ...voter
                }
            }
            createdOn
            lastEditOn
            thisUserIsAdmin
            group {
                handle
                cover
                name
                thisUserIsAdmin
                allowRepresentation
                yourMemberRelation {
                    groupId
                    userId
                    createdOn
                    lastEditOn
                    isMember
                    visibility
                }
            }
            createdBy {
                name
                handle
                avatar
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
            stats{
                directVotesMade
            }
            yourStats {
                directVotesInCommon
                directVotesInAgreement
                directVotesInDisagreement
                indirectVotesMadeByYou
                indirectVotesMadeForYou
			}
        }
        againstCount
        againstMostRepresentingVoters {
            handle
            avatar
            name
            representeeCount
            stats{
                directVotesMade
            }
            yourStats {
                directVotesInCommon
                directVotesInAgreement
                directVotesInDisagreement
                indirectVotesMadeByYou
                indirectVotesMadeForYou
			}
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
            stats{
                directVotesMade
            }
            yourStats {
                directVotesInCommon
                directVotesInAgreement
                directVotesInDisagreement
                indirectVotesMadeByYou
                indirectVotesMadeForYou
			}

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
    fragment voter on Voter {
        handle
        avatar
        name
        stats {
            directVotesMade
        }
        yourStats {
            directVotesInCommon
            directVotesInAgreement
            directVotesInDisagreement
            indirectVotesMadeByYou
            indirectVotesMadeForYou
        }
        vote {
            position
            daysAgo
            inverseDaysAgo
        }
    }
`;

export const QUESTIONS_VOTERS_ALSO_VOTED_ON = gql`
    query($questionText: String!, $group: String!) {
        VotersAlsoVotedOn(questionText: $questionText, group: $group) {
            _id
            questionText
            description
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
                yourStats {
                  usersYouAreRepresentingCount
                  votersYouFollow {
                    handle
                    avatar
                    name
                    stats {
                      directVotesMade
                    }
                    yourStats {
                      directVotesInCommon
                      directVotesInAgreement
                      directVotesInDisagreement
                      indirectVotesMadeByYou
                      indirectVotesMadeForYou
                    }
                    vote {
                      position
                    }
                  }
                }
            }
            allowNewChoices
            groupChannel {
                group
                channel
            }
            resultsOn

            stats {
                ...stats
            }
            votersInCommonStats {
                voterCount
            }
            yourVote {
                ...vote
            }
            yourStats {
                usersYouAreRepresentingCount
                votersYouFollow {
                handle
                avatar
                name
                stats {
                    directVotesMade
                }
                yourStats {
                    directVotesInCommon
                    directVotesInAgreement
                    directVotesInDisagreement
                    indirectVotesMadeByYou
                    indirectVotesMadeForYou
                }
                vote {
                    position
                }
                }
            }
            createdOn
            lastEditOn
            thisUserIsAdmin
            createdBy {
                name
                handle
                avatar
            }
            group {
                handle
                cover
                name
                thisUserIsAdmin
                allowRepresentation
                yourMemberRelation {
                    groupId
                    userId
                    createdOn
                    lastEditOn
                    isMember
                    visibility
                }
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
      $group: String!,
      $Question: JSON!
    ) {
        editQuestion(
            questionText: $questionText,
            group: $group,
            Question: $Question
        )
    }
`;

export const ADD_CHOICE = gql`
    mutation (
        $questionText: String!,
        $group: String!,
        $newChoice: String!
    ) {
        addChoice(
            questionText: $questionText,
            group: $group,
            newChoice: $newChoice
        )
    }
`;