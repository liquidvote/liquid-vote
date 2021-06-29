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

            console.log({
                Vote,
                questionText,
                choiceText,
                group,
                channel
            })

            const Vote_ = await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel,
                    user: AuthUser?.LiquidUser?.handle
                });

            console.log({
                Vote,
                Vote_,
                questionText,
                choiceText,
                group,
                channel,
                new: !!AuthUser && !Vote_
            })

            const savedVote = (!!AuthUser && !Vote_) ?
                (await mongoDB.collection("Votes").insertOne({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group, channel },
                    'position': Vote.position,
                    'isDirect': true,

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                    'user': AuthUser.LiquidUser.handle
                }))?.ops[0] : (
                    !!AuthUser &&
                    Vote_.createdBy === AuthUser.LiquidUser.handle
                ) ? await mongoDB.collection("Votes").updateOne(
                    { _id: Vote_._id },
                    {
                        $set: {
                            'position': Vote.position,
                            'isDirect': true,
                            'lastEditOn': Date.now(),
                        },
                    }
                ) : null;


            // TODO: Create Votes for representees
            //      get UserRepresentations relation
            //          if existant -> add/change representative Vote
            //          if new -> create with representative Vote

            // Update Question Stats
            const QuestionStats = await updateQuestionVotingStats({
                questionId: null,
                choiceText
            });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats
            };
        },
    },
};