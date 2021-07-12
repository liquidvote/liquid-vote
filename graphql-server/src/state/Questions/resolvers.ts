import { ObjectID } from 'mongodb';

export const QuestionResolvers = {
    Query: {
        Question: async (_source, { questionText, group, channel }, { mongoDB, s3, AuthUser }) => {

            const Question = await mongoDB.collection("Questions")
                .findOne({
                    questionText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel
                });

            // TODO: get User Vote

            return {
                ...Question,
                ...(Question?.questionType === 'single' && !!AuthUser) && {
                    stats: Question?.stats,
                    userVote: await mongoDB.collection("Votes").findOne({
                        questionText: Question?.questionText,
                        groupChannel: Question?.groupChannel,
                        createdBy: AuthUser?.LiquidUser?.handle
                    })
                },
                thisUserIsAdmin: Question?.createdBy === AuthUser?.LiquidUser?.handle,
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
                    },
                    userVote: await mongoDB.collection("Votes").findOne({
                        questionText: q.questionText,
                        groupChannel: q.groupChannel,
                        createdBy: AuthUser?.LiquidUser?.handle
                    })
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

                    'stats': {
                        forCount: 0,
                        forDirectCount: 0,
                        againstCount: 0,
                        againstDirectCount: 0,
                        lastVoteOn: null,
                    }
                }))?.ops[0] : (
                    AuthUser &&
                    Question_.createdBy === AuthUser.LiquidUser.handle
                ) ? (await mongoDB.collection("Questions").findOneAndUpdate(
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
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                ))?.value : null;

            return {
                ...savedQuestion,
                thisUserIsAdmin: true
            };
        },
    },
};

export const updateQuestionVotingStats = async ({
    questionText,
    choiceText,
    group,
    channel,
    mongoDB,
    AuthUser
}) => {

    // QUERY:
    //  Get Question
    const Question_ = await mongoDB.collection("Questions")
        .findOne({
            questionText,
            // choiceText,
            'groupChannel.group': group,
            'groupChannel.channel': channel
        });
    //  Get Votes

    // GET VIA AGGREGATION:
    //  Most recent Vote timestamp
    //  Most Relevant Voters

    const VoteCounts = (await mongoDB.collection("Votes")
        .aggregate([
            {
                $match: {
                    "groupChannel.group": group,
                    "groupChannel.channel": channel,
                    "questionText": questionText,
                },
            },
            {
                $group: {
                    _id: {
                        "groupChannel": "$groupChannel",
                        "questionText": "$questionText",
                    },
                    forVotes: {
                        $sum: "$forWeight"
                    },
                    forDirectVotes: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { "$eq": ["$isDirect", true] },
                                        { "$eq": ["$position", 'for'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    againstVotes: {
                        $sum: "$againstWeight"
                    },
                    againstDirectVotes: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { "$eq": ["$isDirect", true] },
                                        { "$eq": ["$position", 'against'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    lastVoteOn: {
                        $last: "$lastEditOn"
                    }
                }
            },
        ])
        .toArray())?.[0];

    // console.log('updateQuestionVotingStats', {
    //     VoteCounts: JSON.stringify(VoteCounts, null, 2)
    // });

    const updatedQuestion = (await mongoDB.collection("Questions").findOneAndUpdate(
        { _id: Question_._id },
        {
            $set: {
                'stats.forCount': VoteCounts?.forVotes || 0,
                'stats.forDirectCount': VoteCounts?.forDirectVotes || 0,
                'stats.againstCount': VoteCounts?.againstVotes || 0,
                'stats.againstDirectCount': VoteCounts?.againstDirectVotes || 0,
                'stats.lastVoteOn': VoteCounts?.lastVoteOn,
            },
        },
        {
            returnNewDocument: true,
            returnOriginal: false
        }
    ))?.value

    return updatedQuestion?.stats;
}