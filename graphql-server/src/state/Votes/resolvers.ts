import { ObjectID } from 'mongodb';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, s3, AuthUser }) => {

            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });
                
            // TODO: get votes

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?.LiquidUser?.handle,
            };
        },
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, group, channel
        }, {
            mongoDB, s3, AuthUser
        }) => {

            console.log({
                Vote,
                questionText, group, channel
            })

            const Vote_ = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            const savedVote = (AuthUser && questionText === 'new') ?
                (await mongoDB.collection("Votes").insertOne({
                    'questionType': Vote.questionType,
                    'questionText': Vote.questionText,
                    'startText': Vote.startText,
                    'choices': Vote.choices,
                    'groupChannel': Vote.groupChannel,
                    'resultsOn': Vote.resultsOn,

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                }))?.ops[0] : (
                    AuthUser &&
                    Vote_.createdBy === AuthUser.LiquidUser.handle
                ) ? await mongoDB.collection("Votes").updateOne(
                    { _id: Vote_._id },
                    {
                        $set: {
                            'questionType': Vote.questionType,
                            'questionText': Vote.questionText,
                            'startText': Vote.startText,
                            'choices': Vote.choices,
                            'groupChannel': Vote.groupChannel,
                            'resultsOn': Vote.resultsOn,
                            'lastEditOn': Date.now(),
                        },
                    }
                ) : null;

            return {
                ...savedVote,
                thisUserIsAdmin: true
            };
        },
    },
};