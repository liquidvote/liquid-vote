import { ObjectId } from 'mongodb';

import { QuestionsAgg } from './aggregationLogic';

export const QuestionResolvers = {
    Query: {
        Question: async (_source, { questionText, group }, { mongoDB, AuthUser }) => {

            const Question = (await mongoDB.collection("Questions")
                .aggregate(QuestionsAgg({
                    questionText,
                    group,
                    AuthUserId: AuthUser?._id
                }))?.toArray())?.[0];

            return {
                ...Question,
                _id: Question?.id,
                ...(Question?.questionType === 'single' && !!AuthUser) && {
                    yourVote: Question?.choices[0]?.yourVote
                },
                ...(Question?.questionType === 'multi' && !!AuthUser) && {
                    // stats: Question?.stats,
                    choices: await Promise.all(Question?.choices?.map(async (c) => ({
                        ...c?.choice,
                        yourVote: c?.yourVote
                    }))),
                },
                thisUserIsAdmin: Question?.createdBy?.handle === AuthUser?.LiquidUser?.handle,
            };
        },
        Questions: async (_source, {
            group,
            sortBy
        }, { mongoDB, AuthUser }) => {

            const Questions = await mongoDB.collection("Questions")
                .aggregate(
                    [
                        ...QuestionsAgg({
                            questionText: null,
                            group,
                            AuthUserId: AuthUser?._id
                        }),
                        {
                            '$addFields': {
                                'stats.lastEditOrVote': {
                                    '$cond': [
                                        {
                                            '$gt': [
                                                '$lastEditOn', '$stats.lastVoteOn'
                                            ]
                                        }, '$lastEditOn', '$stats.lastVoteOn'
                                    ]
                                },
                                'stats.totalVotes': {
                                    '$sum': [
                                        '$stats.directVotes', '$stats.indirectVotes'
                                    ]
                                },
                            }
                        },
                        ...(sortBy === 'weight') ? [
                            {
                                '$sort': { 'stats.totalVotes': -1 }
                            }
                        ] : [],
                        ...(sortBy === 'time') ? [
                            {
                                '$sort': { 'stats.lastEditOrVote': -1 }
                            }
                        ] : []
                    ]
                )
                .toArray();

            return await Promise.all(Questions.map(async (q) => ({
                ...q,
                _id: q?.id,
                ...(q.questionType === 'single' && !!AuthUser) && {
                    yourVote: q?.choices[0]?.yourVote
                },
                ...(q.questionType === 'multi' && !!AuthUser) && {
                    choices: await Promise.all(q?.choices?.map(async (c) => ({
                        ...c?.choice,
                        yourVote: c?.yourVote
                    })))
                },
                thisUserIsAdmin: q?.createdBy?.handle === AuthUser?.LiquidUser?.handle,
            })));
        }
    },
    Mutation: {
        editQuestion: async (_source, {
            Question, questionText, group
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) return;

            const Question_ = await mongoDB.collection("Questions")
                .findOne({ questionText, 'groupChannel.group': group });

            if (!!Question_ && AuthUser._id.toString() !== Question_?.createdBy.toString()) { return };

            const dbDoc = !!AuthUser && (await mongoDB.collection("Questions")
                .findOneAndUpdate({
                    questionText: Question.questionText,
                    'groupChannel.group': group,
                }, {
                    $set: {
                        'description': Question.description,

                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        'questionType': Question.questionType,
                        'questionText': Question.questionText,
                        // 'description': Question.description,
                        'startText': Question.startText,
                        'choices': Question.choices
                            .filter(c => c.text !== "")
                            .map(c => ({
                                ...c,
                                'stats': {
                                    forCount: 0,
                                    forDirectCount: 0,
                                    againstCount: 0,
                                    againstDirectCount: 0,
                                    lastVoteOn: null,
                                }
                            })),
                        'groupChannel': Question.groupChannel,
                        'resultsOn': Question.resultsOn,

                        // 'lastEditOn': Date.now(),
                        'createdOn': Date.now(),
                        'createdBy': AuthUser._id,

                        'stats': {
                            forCount: 0,
                            forDirectCount: 0,
                            againstCount: 0,
                            againstDirectCount: 0,
                            lastVoteOn: null,
                        }
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            return {
                ...dbDoc,
                thisUserIsAdmin: true
            };
        },
    },
};

export const updateQuestionVotingStats = async ({
    questionText,
    choiceText,
    group,
    // channel,
    mongoDB,
    AuthUser
}) => {

    const Question_ = await mongoDB.collection("Questions")
        .findOne({
            questionText,
            // choiceText,
            'groupChannel.group': group,
            // 'groupChannel.channel': channel
        });

    const VoteCounts = async ({ choiceText }) => (await mongoDB.collection("Votes")
        .aggregate([
            {
                $match: {
                    "groupChannel.group": group,
                    // "groupChannel.channel": channel,
                    "questionText": questionText,
                    ...choiceText && { "choiceText": choiceText }
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

    const DirectVotersByPosition = async ({ choiceText }) => (await mongoDB.collection("Votes")
        .aggregate([
            {
                '$match': {
                    // 'position': {
                    //     '$in': [
                    //         'for', 'against'
                    //     ]
                    // },
                    'isDirect': true,
                    "groupChannel.group": group,
                    // "groupChannel.channel": channel,
                    "questionText": questionText,
                    ...choiceText && { "choiceText": choiceText }
                }
            },
            {
                $lookup: {
                    from: 'Votes',
                    let: {
                        representativeId: "$user"
                    },
                    pipeline: [
                        {
                            $match: {
                                questionText,
                                choiceText,
                                ...choiceText && { "choiceText": choiceText },
                                'groupChannel.group': group,
                                // 'groupChannel.channel': channel,
                            }
                        },
                        { $unwind: '$representatives' },
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        "$representatives.representativeId",
                                        { "$toObjectId": "$$representativeId" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'representees'
                }
            },
            {
                '$project': {
                    'user': 1,
                    'position': 1,
                    'representeeCount': {
                        '$size': { "$ifNull": ["$representees", []] }
                    }
                }
            }, {
                '$sort': {
                    'representeeCount': -1
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$project': {
                    'user': {
                        '$first': '$user.LiquidUser'
                    },
                    'position': 1,
                    'representeeCount': 1
                }
            }, {
                '$group': {
                    '_id': '$position',
                    'voters': {
                        '$push': {
                            'handle': '$user.handle',
                            'avatar': '$user.avatar',
                            'name': '$user.name',
                            'representeeCount': '$representeeCount'
                        }
                    },
                    'count': {
                        '$sum': 1
                    }
                }
            }
        ])
        .toArray()
    )?.reduce((acc, curr) => ({
        ...acc,
        [curr._id]: curr
    }), {});

    const questionVoteCounts = await VoteCounts({ choiceText: undefined });
    const questionDirectVotersByPosition = await DirectVotersByPosition({ choiceText: undefined });
    const choiceVoteCounts = !!choiceText && await VoteCounts({ choiceText });
    const choiceDirectVotersByPosition = !!choiceText && await DirectVotersByPosition({ choiceText });

    const updatedQuestion = (await mongoDB.collection("Questions").findOneAndUpdate(
        { _id: Question_._id },
        {

            $set: {
                'stats.forCount': questionVoteCounts?.forVotes || 0,
                'stats.forDirectCount': questionVoteCounts?.forDirectVotes || 0,
                'stats.againstCount': questionVoteCounts?.againstVotes || 0,
                'stats.againstDirectCount': questionVoteCounts?.againstDirectVotes || 0,
                'stats.lastVoteOn': questionVoteCounts?.lastVoteOn,
                'stats.forMostRepresentingVoters': questionDirectVotersByPosition?.for?.voters,
                'stats.againstMostRepresentingVoters': questionDirectVotersByPosition?.against?.voters,
                'stats.directVotes': questionVoteCounts?.forDirectVotes + questionVoteCounts?.againstDirectVotes || 0,
                'stats.indirectVotes':
                    (questionVoteCounts?.forVotes - questionVoteCounts?.forDirectVotes) +
                    (questionVoteCounts?.againstVotes - questionVoteCounts?.againstDirectVotes) || 0,
                ...(!!choiceText) && {
                    'choices': Question_.choices.map(c => ({
                        ...c,
                        ...(c.text === choiceText) && {
                            stats: {
                                'forCount': choiceVoteCounts?.forVotes || 0,
                                'forDirectCount': choiceVoteCounts?.forDirectVotes || 0,
                                'againstCount': choiceVoteCounts?.againstVotes || 0,
                                'againstDirectCount': choiceVoteCounts?.againstDirectVotes || 0,
                                'lastVoteOn': choiceVoteCounts?.lastVoteOn,
                                'forMostRepresentingVoters': choiceDirectVotersByPosition?.for?.voters,
                                'againstMostRepresentingVoters': choiceDirectVotersByPosition?.against?.voters,
                                'directVotes': choiceVoteCounts?.forDirectVotes + choiceVoteCounts?.againstDirectVotes || 0,
                                'indirectVotes':
                                    (choiceVoteCounts?.forVotes - choiceVoteCounts?.forDirectVotes) +
                                    (choiceVoteCounts?.againstVotes - choiceVoteCounts?.againstDirectVotes) || 0,
                            }
                        }
                    }))
                }
            }
        },
        {
            returnDocument: 'after'
        }
    ))?.value

    return !choiceText ?
        updatedQuestion?.stats :
        updatedQuestion?.choices.find(c => c.text === choiceText)?.stats;
}