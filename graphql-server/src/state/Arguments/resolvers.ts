import { ObjectId } from 'mongodb';

export const ArgumentResolvers = {
    Query: {
        Argument: async (_source, { questionText, groupHandle, userHandle }, { mongoDB, AuthUser }) => {

            const group = await mongoDB.collection("Groups").findOne({
                handle: groupHandle,
            });

            const question = await mongoDB.collection("Questions").findOne({
                questionText,
                'groupChannel.group': groupHandle
            });

            const user = await mongoDB.collection("Users").findOne({
                'LiquidUser.handle': userHandle,
            });

            return {
                ...await mongoDB.collection("Arguments")
                    .findOne({
                        question: new ObjectId(question._id),
                        group: new ObjectId(group._id),
                        user: new ObjectId(user._id)
                    }),
                group,
                question,
                user: user?.LiquidUser
            }
        },
        Arguments: async (_source, {
            questionText,
            groupHandle,
            userHandle,
            sortBy
        }, { mongoDB, AuthUser }) => {

            const group = await mongoDB.collection("Groups").findOne({
                handle: groupHandle,
            });

            const question = await mongoDB.collection("Questions").findOne({
                questionText,
                'groupChannel.group': groupHandle
            });

            const argumentList = (
                await mongoDB.collection("Arguments")
                    .aggregate([
                        {
                            '$match': {
                                'group': new ObjectId(group._id),
                                'question': new ObjectId(question._id)
                            }
                        }, {
                            '$lookup': {
                                'from': 'Groups',
                                'localField': 'group',
                                'foreignField': '_id',
                                'as': 'group'
                            }
                        }, {
                            '$lookup': {
                                'from': 'Users',
                                'localField': 'user',
                                'foreignField': '_id',
                                'as': 'user'
                            }
                        }, {
                            '$lookup': {
                                'from': 'Questions',
                                'localField': 'question',
                                'foreignField': '_id',
                                'as': 'question'
                            }
                        }, {
                            '$addFields': {
                                'user': {
                                    '$first': '$user'
                                },
                                'group': {
                                    '$first': '$group'
                                },
                                'question': {
                                    '$first': '$question'
                                }
                            }
                        }, {
                            '$addFields': {
                                'user': '$user.LiquidUser'
                            }
                        }
                    ])?.toArray()
            );

            console.log({
                argumentList
            });

            return argumentList;
        },
    },
    Mutation: {
        editArgument: async (_source, {
            ArgumentEdits,
            questionText,
            groupHandle,
            userHandle
        }, {
            mongoDB, AuthUser
        }) => {

            const group = await mongoDB.collection("Groups").findOne({
                handle: groupHandle,
            });

            const question = await mongoDB.collection("Questions").findOne({
                questionText,
                'groupChannel.group': groupHandle
            });

            const user = await mongoDB.collection("Users").findOne({
                'LiquidUser.handle': userHandle,
            });

            const dbDoc = !!AuthUser && (await mongoDB.collection("Arguments")
                .findOneAndUpdate({
                    question: new ObjectId(question._id),
                    group: new ObjectId(group._id),
                    user: new ObjectId(user._id)
                }, {
                    $set: {
                        argumentText: ArgumentEdits?.argumentText,

                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        question: new ObjectId(question._id),
                        group: new ObjectId(group._id),
                        user: new ObjectId(user._id),
                        createdOn: Date.now()
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            return { ...dbDoc };
        },
    },
};