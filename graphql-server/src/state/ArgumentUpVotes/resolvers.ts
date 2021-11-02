import { ObjectId } from 'mongodb';
import { updateArgumentStats } from '../Arguments/resolvers';

export const ArgumentUpVotesResolvers = {
    Query: {
    },
    Mutation: {
        editArgumentUpVote: async (_source, {
            voted,
            questionText,
            groupHandle,
            userHandle
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) return null;

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

            const argument = await mongoDB.collection("Arguments").findOne({
                question: new ObjectId(question._id),
                group: new ObjectId(group._id),
                user: new ObjectId(user._id)
            });

            const dbDoc = !!AuthUser && (await mongoDB.collection("ArgumentUpVotes")
                .findOneAndUpdate({
                    argument: new ObjectId(argument._id),
                    question: new ObjectId(question._id),
                    group: new ObjectId(group._id),
                    user: new ObjectId(AuthUser._id)
                }, {
                    $set: {
                        voted,
                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        question: new ObjectId(question._id),
                        group: new ObjectId(group._id),
                        user: new ObjectId(AuthUser._id),
                        createdOn: Date.now()
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            const updateArgumentStats_ = await updateArgumentStats({
                argumentId: argument._id,
                mongoDB
            });

            return {
                ...dbDoc,
                argument: {
                    ...argument,
                    stats: updateArgumentStats_
                },
            };
        },
    },
};