import { ObjectID } from 'mongodb';

import { updateQuestionVotingStats } from '../Questions/resolvers';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, s3, AuthUser }) => {

            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?.LiquidUser?.handle,
            };
        },
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group, channel
        }, {
            mongoDB, s3, AuthUser
        }) => {

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel,
                    user: AuthUser?.LiquidUser?.handle
                });

            const savedVote = (!!AuthUser && !Vote_) ?
                (await mongoDB.collection("Votes").insertOne({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group, channel },
                    'position': Vote.position,
                    'forWeight': Vote.position === 'for' ? 1 : 0,
                    'againstWeight': Vote.position === 'against' ? 1 : 0,
                    'isDirect': true,
                    'representatives': [],

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                    'user': AuthUser.LiquidUser.handle
                }))?.ops[0] : (
                    !!AuthUser &&
                    Vote_.createdBy === AuthUser.LiquidUser.handle
                ) ? (await mongoDB.collection("Votes").findOneAndUpdate(
                    { _id: Vote_._id },
                    {
                        $set: {
                            'position': Vote.position,
                            'forWeight': Vote.position === 'for' ? 1 : 0,
                            'againstWeight': Vote.position === 'against' ? 1 : 0,
                            'isDirect': true,
                            'lastEditOn': Date.now(),
                        },
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                ))?.value : null;


            // TODO: Create Votes for representees
            const representeesAndVote = [];

            //      get UserRepresentations relation
            //          if Vote existant -> add/change representative Vote
            //          if Vote new -> create with representative Vote
            //          if Vote is not Direct -> calculate vote result

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                channel,
                mongoDB,
                AuthUser
            });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats
            };
        },
    },
};