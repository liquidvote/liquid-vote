import { ObjectID } from 'mongodb';

export const QuestionResolvers = {
    Query: {
        Question: async (_source, { questionText, group, channel }, { mongoDB, s3, AuthUser }) => {

            const Question = await mongoDB.collection("Questions")
                .findOne({ questionText, group, channel });

            // TODO: get User Vote

            return {
                ...Question,
                thisUserIsAdmin: Question.createdBy === AuthUser?.LiquidUser?.handle,
            };
        },
        Questions: async (_source, {
            group,
            channels
        }, { mongoDB, s3, AuthUser }) => {

            // console.log('Questions', { group, channels });

            const Questions = await mongoDB.collection("Questions")
                .find({ 'groupChannel.group': group })
                .toArray();

            return await Promise.all(Questions.map(async (q) => ({
                ...q,
                thisUserIsAdmin: q.createdBy === AuthUser?.LiquidUser?.handle,
                ...(q.questionType === 'single' && !!AuthUser) && {
                    stats: {
                        ...q.stats,
                        userVote: await mongoDB.collection("Votes").findOne({
                            questionText: q.questionText,
                            groupChannel: q.groupChannel,
                            createdBy: AuthUser?.LiquidUser?.handle
                        })
                    }
                },
                ...(q.questionType === 'multi' && !!AuthUser) && {
                    choices: Promise.all(q.choices.map(async (c) => ({
                        ...c,
                        stats: {
                            ...q.stats,
                            userVote: await mongoDB.collection("Votes").findOne({
                                questionText: q.questionText,
                                groupChannel: q.groupChannel,
                                choiceText: q.choiceText,
                                createdBy: AuthUser?.LiquidUser?.handle
                            })
                        },
                    })))
                }
            })));
        },
    },
    Mutation: {
        editQuestion: async (_source, {
            Question, questionText, group, channel
        }, {
            mongoDB, s3, AuthUser
        }) => {

            console.log({
                Question,
                questionText, group, channel
            })

            const Question_ = await mongoDB.collection("Questions")
                .findOne({ questionText, group, channel });

            const savedQuestion = (AuthUser && questionText === 'new') ?
                (await mongoDB.collection("Questions").insertOne({
                    'questionType': Question.questionType,
                    'questionText': Question.questionText,
                    'startText': Question.startText,
                    'choices': Question.choices,
                    'groupChannel': Question.groupChannel,
                    'resultsOn': Question.resultsOn,

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                }))?.ops[0] : (
                    AuthUser &&
                    Question_.createdBy === AuthUser.LiquidUser.handle
                ) ? await mongoDB.collection("Questions").updateOne(
                    { _id: Question_._id },
                    {
                        $set: {
                            'questionType': Question.questionType,
                            'questionText': Question.questionText,
                            'startText': Question.startText,
                            'choices': Question.choices,
                            'groupChannel': Question.groupChannel,
                            'resultsOn': Question.resultsOn,
                            'lastEditOn': Date.now(),
                        },
                    }
                ) : null;

            return {
                ...savedQuestion,
                thisUserIsAdmin: true
            };
        },
    },
};

export const updateQuestionVotingStats = async ({
    questionId,
    choiceText
}) => {

    console.log('updateQuestionVotingStats')

    // QUERY:
    //  Get Question
    //  Get Votes

    // GET VIA AGGREGATION:
    //  Direct and Indirect Votes Count
    //  Most recent Vote timestamp
    //  Most Relevant Voters

    // UPDATE:
    //  lastVoteOn: String
    //  userVote: Vote
    //  forCount: Int
    //  forDirectCount: Int
    //  forMostRelevantVoters: [JSON]
    //  againstCount: Int
    //  againstMostRelevantVoters: [JSON]
    //  againstDirectCount: Int

    return {};
}