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
                    userVote: {
                        ...await mongoDB.collection("Votes").findOne({
                            questionText: Question?.questionText,
                            groupChannel: Question?.groupChannel,
                            user: AuthUser?._id
                        })
                    }
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
        QuestionVoters: async (_source, { questionText, group, channel, typeOfVoter }, { mongoDB, s3, AuthUser }) => {


            console.log({
                // questionText,
                // group,
                // channel,
                typeOfVoter
            });

            const Question = await mongoDB.collection("Questions")
                .findOne({
                    questionText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel
                });

            const directVoters = async () => (await mongoDB.collection("Votes")
                .aggregate([
                    {
                        '$match': {
                            'isDirect': true,
                            "groupChannel.group": group,
                            "groupChannel.channel": channel,
                            "questionText": questionText,
                            "position": typeOfVoter === 'directFor' ? 'for' : 'against'
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
                                        // choiceText,
                                        'groupChannel.group': group,
                                        'groupChannel.channel': channel,
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
                                },
                                {
                                    '$lookup': {
                                        'from': 'Users',
                                        'localField': 'user',
                                        'foreignField': '_id',
                                        'as': 'user'
                                    }
                                },
                                {
                                    '$addFields': {
                                        'user': { '$first': '$user.LiquidUser' }
                                    }
                                }
                            ],
                            as: 'representeeVotes'
                        }
                    },
                    {
                        '$addFields': {
                            'representeeCount': {
                                '$size': { "$ifNull": ["$representeeVotes", []] }
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
                        '$addFields': {
                            'user': {
                                '$first': '$user.LiquidUser'
                            }
                        }
                    }
                ])
                .toArray()
            );

            const representingYou = async () => !!AuthUser ? (await mongoDB.collection("Votes")
                .aggregate([
                    {
                        '$match': {
                            "groupChannel.group": group,
                            "groupChannel.channel": channel,
                            "questionText": questionText,
                            'user': new ObjectID(AuthUser._id)
                        }
                    }, {
                        '$unwind': {
                            'path': '$representatives'
                        }
                    }, {
                        '$project': {
                            'questionText': 1,
                            'groupChannel': 1,
                            'user._id': '$representatives.representativeId',
                            'user.name': '$representatives.representativeName',
                            'user.handle': '$representatives.representativeHandle',
                            'user.avatar': '$representatives.representativeAvatar',
                            'position': '$representatives.position',
                            "isDirect": { '$toBool': true },
                            'forWeight': '$representatives.forWeight',
                            'againstWeight': '$representatives.againstWeight',
                            'lastEditOn': '$representatives.lastEditOn',
                        }
                    }, {
                        '$lookup': {
                            'from': 'Votes',
                            'let': {
                                'representativeId': '$user._id'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        "groupChannel.group": group,
                                        "groupChannel.channel": channel,
                                        "questionText": questionText,
                                    }
                                }, {
                                    '$unwind': '$representatives'
                                }, {
                                    '$match': {
                                        '$expr': {
                                            '$eq': [
                                                '$representatives.representativeId', {
                                                    '$toObjectId': '$$representativeId'
                                                }
                                            ]
                                        }
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
                                    '$addFields': {
                                        'user': { '$first': '$user.LiquidUser' }
                                    }
                                }
                            ],
                            'as': 'representeeVotes'
                        }
                    }, {
                        '$addFields': {
                            'representeeCount': {
                                '$size': {
                                    '$ifNull': [
                                        '$representeeVotes', []
                                    ]
                                }
                            }
                        }
                    }, {
                        '$sort': {
                            'representeeCount': -1
                        }
                    }

                ])
                .toArray()
            ) : [];

            const representedByYou = async () => !!AuthUser ? (await mongoDB.collection("Votes")
                .aggregate([
                    {
                        '$match': {
                            "groupChannel.group": group,
                            "groupChannel.channel": channel,
                            "questionText": questionText,
                            'user': new ObjectID(AuthUser._id)
                        }
                    }, {
                        '$lookup': {
                            'from': 'Votes',
                            'let': {
                                'representativeId': '$user'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        "groupChannel.group": group,
                                        "groupChannel.channel": channel,
                                        "questionText": questionText,
                                    }
                                }, {
                                    '$addFields': {
                                        'representatives_': '$representatives'
                                    }
                                }, {
                                    '$unwind': '$representatives_'
                                }, {
                                    '$match': {
                                        '$expr': {
                                            '$eq': [
                                                '$representatives_.representativeId', {
                                                    '$toObjectId': '$$representativeId'
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            'as': 'representeeVotes'
                        }
                    }, {
                        '$unwind': {
                            'path': '$representeeVotes'
                        }
                    }, {
                        '$project': {
                            'questionText': 1,
                            'groupChannel': 1,
                            'isDirect': '$representeeVotes.isDirect',
                            'user': '$representeeVotes.user',
                            'position': '$representeeVotes.position',
                            'representatives': '$representeeVotes.representatives',
                            'forWeight': '$representeeVotes.forWeight',
                            'againstWeight': '$representeeVotes.againstWeight',
                            'lastEditOn': '$representeeVotes.lastEditOn'
                        }
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'user',
                            'foreignField': '_id',
                            'as': 'user'
                        }
                    }, {
                        '$addFields': {
                            'user': {
                                '$first': '$user.LiquidUser'
                            }
                        }
                    }
                ])
                .toArray()
            ) : [];

            console.log({
                directVoters: (await directVoters()).map(v => v.representeeVotes)
            });

            return [
                ...(typeOfVoter === 'directFor' || typeOfVoter === 'directAgainst') ?
                    await directVoters() : [],
                ...(!!AuthUser && typeOfVoter === 'representingYou') ?
                    await representingYou() : [],
                ...(!!AuthUser && typeOfVoter === 'representedByYou') ?
                    await representedByYou() : [],
            ];
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

    const Question_ = await mongoDB.collection("Questions")
        .findOne({
            questionText,
            // choiceText,
            'groupChannel.group': group,
            'groupChannel.channel': channel
        });

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

    const DirectVotersByPosition = (await mongoDB.collection("Votes")
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
                    "groupChannel.channel": channel,
                    "questionText": questionText,
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
                                'groupChannel.group': group,
                                'groupChannel.channel': channel,
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

    const updatedQuestion = (await mongoDB.collection("Questions").findOneAndUpdate(
        { _id: Question_._id },
        {
            $set: {
                'stats.forCount': VoteCounts?.forVotes || 0,
                'stats.forDirectCount': VoteCounts?.forDirectVotes || 0,
                'stats.againstCount': VoteCounts?.againstVotes || 0,
                'stats.againstDirectCount': VoteCounts?.againstDirectVotes || 0,
                'stats.lastVoteOn': VoteCounts?.lastVoteOn,
                'stats.forMostRepresentingVoters': DirectVotersByPosition?.for?.voters,
                'stats.againstMostRepresentingVoters': DirectVotersByPosition?.against?.voters,
            },
        },
        {
            returnNewDocument: true,
            returnOriginal: false
        }
    ))?.value

    return updatedQuestion?.stats;
}