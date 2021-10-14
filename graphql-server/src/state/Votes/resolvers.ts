import { ObjectId } from 'mongodb';

import { updateQuestionVotingStats } from '../Questions/resolvers';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, AuthUser }) => {

            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?.LiquidUser?.handle,
            };
        },
        Votes: async (_source, {
            questionText,
            choiceText,
            groupHandle,
            userHandle,
            type = 'directVotesMade',
            sortBy
        }, { mongoDB, AuthUser }) => {

            const User = !!userHandle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': userHandle });

            console.log({
                questionText,
                choiceText,
                groupHandle,
                userHandle,
                type,
                sortBy
            });

            const AggregateLogic = {
                matchVoteToParams: (
                    [
                        {
                            '$match': {
                                ...(!!questionText) && {
                                    'questionText': questionText
                                },
                                ...(!!choiceText) && {
                                    'choiceText': choiceText
                                },
                                ...(!!userHandle) && {
                                    'user': new ObjectId(User._id)
                                },
                                ...(!!groupHandle) && {
                                    'groupChannel.group': groupHandle
                                },
                                'position': { $ne: null }
                            }
                        }
                    ]
                ),
                voteInCommon: (
                    [
                        {
                            '$lookup': {
                                'from': 'Votes',
                                'let': {
                                    'userId': new ObjectId(AuthUser?._id),
                                    'questionText': '$questionText',
                                    'choiceText': '$choiceText',
                                    'group': '$groupChannel.group',
                                },
                                'pipeline': [
                                    {
                                        '$match': {
                                            '$and': [
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$user', {
                                                                '$toObjectId': '$$userId'
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$questionText', '$$questionText'
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$choiceText', '$$choiceText'
                                                        ]
                                                    }
                                                },
                                                ...(!!groupHandle) ? [
                                                    {
                                                        '$expr': {
                                                            '$eq': [
                                                                '$groupChannel.group', '$$group'
                                                            ]
                                                        }
                                                    }
                                                ] : []
                                            ]
                                        }
                                    }
                                ],
                                'as': 'yourVote'
                            }
                        },
                        {
                            '$addFields': {
                                'yourVote': {
                                    '$first': '$yourVote'
                                }
                            }
                        }, {
                            '$addFields': {
                                'byYou': {
                                    '$eq': ['$user', new ObjectId(AuthUser?._id)]
                                },
                                'bothDirect': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$isDirect', true
                                            ]
                                        }, {
                                            '$eq': [
                                                '$yourVote.isDirect', true
                                            ]
                                        }
                                    ]
                                },
                                'InAgreement': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$position', '$yourVote.position'
                                            ]
                                        }
                                    ]
                                },
                                'yourVoteMadeByUser': {
                                    $cond: {
                                        if: {
                                            '$or': [
                                                { $not: ["$yourVote"] },
                                                { $eq: ["$yourVote.isDirect", true] }
                                            ]
                                        },
                                        then: false,
                                        else: {
                                            '$gte': [
                                                {
                                                    '$size': {
                                                        '$filter': {
                                                            'input': '$yourVote.representatives',
                                                            'as': 'r',
                                                            'cond': {
                                                                '$and': [
                                                                    {
                                                                        '$eq': [
                                                                            '$$r.representativeId', '$user'
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }, 1
                                            ]
                                        }
                                    }
                                },
                                'yourVoteMadeForUser': {
                                    $cond: {
                                        if: { $eq: ["$isDirect", true] },
                                        then: false,
                                        else: {
                                            '$gte': [
                                                {
                                                    '$size': {
                                                        '$filter': {
                                                            'input': '$representatives',
                                                            'as': 'r',
                                                            'cond': {
                                                                '$eq': [
                                                                    '$$r.representativeId', new ObjectId(AuthUser?._id)
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }, 1
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                    ]
                ),
                representeeVotes: (
                    [
                        {
                            '$lookup': {
                                'from': 'Votes',
                                'let': {
                                    'representativeId': { '$toObjectId': '$user' },
                                    'questionText': '$questionText',
                                    // 'choiceText': '$choiceText',
                                    'group': '$groupChannel.group'
                                },
                                'pipeline': [
                                    {
                                        '$match': {
                                            '$and': [
                                                { 'isDirect': false },
                                                { 'position': { $ne: null } },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$questionText', '$$questionText'
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$choiceText', '$$choiceText'
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$groupChannel.group', '$$group'
                                                        ]
                                                    }
                                                },
                                            ]
                                        }
                                    },
                                    {
                                        '$match': {
                                            '$expr': {
                                                '$gte': [
                                                    {
                                                        '$size': {
                                                            '$filter': {
                                                                'input': '$representatives',
                                                                'as': 'r',
                                                                'cond': {
                                                                    '$eq': [
                                                                        '$$r.representativeId', '$$representativeId'
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    }, 1
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
                                    }, {
                                        '$addFields': {
                                            'user': { '$first': '$user.LiquidUser' }
                                        }
                                    }
                                ],
                                'as': 'representeeVotes'
                            }
                        },
                        {
                            '$addFields': { 'representeeCount': { $size: "$representeeVotes" } }
                        }
                    ]
                ),
                representeeVotesAsList: (
                    [
                        { '$unwind': '$representeeVotes' },
                        { '$replaceRoot': { newRoot: '$representeeVotes' } }
                    ]
                ),
                mergedChoices: (
                    [
                        {
                            '$sort': {
                                'lastEditOn': -1
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$user',
                                    'questionText': '$questionText',
                                    'groupChannel': '$groupChannel'
                                },
                                'lastEditOn': { '$last': '$lastEditOn' },
                                'choiceVotes': { '$push': '$$ROOT' },
                                'representees': { '$push': '$representeeVotes' },
                                'representatives': { '$push': '$representatives' },
                                'user': { '$first': '$user' },
                                'questionText': { '$first': '$questionText' },
                                'groupChannel': { '$first': '$groupChannel' },
                                'yourVote': { '$first': '$yourVote' },
                                'byYou': { '$first': '$byYou' },
                                'bothDirect': { '$first': '$bothDirect' },
                                'InAgreement': { '$first': '$InAgreement' },
                                'yourVoteMadeByUser': { '$first': '$yourVoteMadeByUser' },
                                'yourVoteMadeForUser': { '$first': '$yourVoteMadeForUser' },
                            }
                        }
                    ]
                ),
                mergedChoicesUniqueRepresentees: (
                    [
                        {
                            '$unwind': {
                                'path': '$representees'
                            }
                        }, {
                            '$unwind': {
                                'path': '$representees'
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel',
                                    'representeeHandle': '$representees.user.handle'
                                },
                                'roots': {
                                    '$first': '$$ROOT'
                                }
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel'
                                },
                                'lastEditOn': {
                                    '$first': '$roots.lastEditOn'
                                },
                                'choiceVotes': {
                                    '$first': '$roots.choiceVotes'
                                },
                                'representees': {
                                    '$push': '$roots.representees'
                                },
                                'representeeCount': {
                                    '$sum': 1
                                },
                                'byYouCount': { $sum: { $cond: ["$byYou", 1, 0] } },
                                'bothDirectCount': { $sum: { $cond: ["$bothDirect", 1, 0] } },
                                'InAgreementCount': { $sum: { $cond: ["$InAgreement", 1, 0] } },
                                'yourVoteMadeByUserCount': { $sum: { $cond: ["$yourVoteMadeByUser", 1, 0] } },
                                'yourVoteMadeForUserCount': { $sum: { $cond: ["$yourVoteMadeForUser", 1, 0] } },
                            }
                        }
                    ]
                ),
                mergedChoicesUniqueRepresentatives: (
                    [
                        {
                            '$unwind': {
                                'path': '$representatives'
                            }
                        }, {
                            '$unwind': {
                                'path': '$representatives'
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel',
                                    'representativeHandle': '$representatives.representativeHandle'
                                },
                                'root': {
                                    '$first': '$$ROOT'
                                }
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel'
                                },
                                'lastEditOn': {
                                    '$first': '$root.lastEditOn'
                                },
                                'choiceVotes': {
                                    '$first': '$root.choiceVotes'
                                },
                                'representatives': {
                                    '$push': '$root.representatives'
                                },
                                'representativesCount': {
                                    '$sum': 1
                                },
                                // 'representees': { '$first': '$root.representees' },
                                'user': { '$first': '$root.user' },
                                'questionText': { '$first': '$root.questionText' },
                                'groupChannel': { '$first': '$root.groupChannel' },
                                'yourVote': { '$first': '$root.yourVote' },
                                'byYou': { '$first': '$byYou' },
                                'bothDirect': { '$first': '$bothDirect' },
                                'InAgreement': { '$first': '$InAgreement' },
                                'yourVoteMadeByUser': { '$first': '$yourVoteMadeByUser' },
                                'yourVoteMadeForUser': { '$first': '$yourVoteMadeForUser' },
                                'byYouCount': { $sum: { $cond: ["$byYou", 1, 0] } },
                                'bothDirectCount': { $sum: { $cond: ["$bothDirect", 1, 0] } },
                                'InAgreementCount': { $sum: { $cond: ["$InAgreement", 1, 0] } },
                                'yourVoteMadeByUserCount': { $sum: { $cond: ["$yourVoteMadeByUser", 1, 0] } },
                                'yourVoteMadeForUserCount': { $sum: { $cond: ["$yourVoteMadeForUser", 1, 0] } },
                            }
                        }
                    ]
                ),

                // remove
                questionStats: (
                    [
                        {
                            $lookup: {
                                from: 'Questions',
                                let: {
                                    questionText: "$questionText",
                                    choiceText: "$choiceText",
                                    group: "$groupChannel.group",
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$questionText', '$$questionText'
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$groupChannel.group', '$$group'
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ],
                                as: 'question'
                            }
                        },
                        {
                            $addFields: {
                                QuestionStats: {
                                    $cond: {
                                        if: {
                                            $not: ["$choiceText"]
                                        },
                                        then: { $first: '$question.stats' },
                                        else: {
                                            $let: {
                                                vars: {
                                                    choice: {
                                                        $first: {
                                                            '$filter': {
                                                                'input': { $first: '$question.choices' },
                                                                'as': 'c',
                                                                'cond': {
                                                                    '$eq': [
                                                                        '$$c.text', '$choiceText'
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    }
                                                },
                                                in: "$$choice.stats"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                ),
                question: (
                    [
                        {
                            $lookup: {
                                from: 'Questions',
                                let: {
                                    questionText: "$questionText",
                                    group: "$groupChannel.group",
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$questionText', '$$questionText'
                                                        ]
                                                    }
                                                },
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$groupChannel.group', '$$group'
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ],
                                as: 'question'
                            }
                        },
                        {
                            $addFields: {
                                question: { $first: '$question' }
                            }
                        }
                    ]
                ),
                userObject: (
                    [
                        {
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
                    ]
                ),
                sortLogic: (
                    [
                        ...(sortBy === 'weight') ? [
                            {
                                '$sort': { representeeCount: -1 }
                            }
                        ] : [],
                        ...(sortBy === 'time') ? [
                            {
                                '$sort': { lastEditOn: -1 }
                            }
                        ] : []
                    ]
                )
            }

            const Votes = await (async (type) => {
                return {
                    'directFor': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'position': 'for',
                                    'isDirect': true
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'directAgainst': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'position': 'against',
                                    'isDirect': true
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'directVotesMade': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'isDirect': true
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'directVotesInAgreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'InAgreement': true,
                                    'bothDirect': true,
                                    'byYou': false
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'directVotesInDisagreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'InAgreement': false,
                                    'bothDirect': true,
                                    'byYou': false
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'indirectVotesMade': async () => await mongoDB.collection("Votes") // hum
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.representeeVotesAsList,
                            ...AggregateLogic.questionStats
                        ])
                        .toArray(),
                    'indirectVotesMadeForUser': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            // {
                            //     '$match': {
                            //         'isDirect': false
                            //     }
                            // },
                            ...AggregateLogic.voteInCommon,
                            ...AggregateLogic.mergedChoices,
                            ...AggregateLogic.mergedChoicesUniqueRepresentatives,
                            {
                                '$match': {
                                    'byYouCount': 0
                                }
                            },
                            ...AggregateLogic.question,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'indirectVotesMadeByUser': async () => await mongoDB.collection("Votes") // hum
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.representeeVotesAsList,
                            ...AggregateLogic.questionStats
                        ])
                        .toArray(),
                    'indirectVotesMadeByYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'yourVoteMadeForUser': true
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'indirectVotesMadeForYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'yourVoteMadeByUser': true
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                    'directVotesMadeByYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...AggregateLogic.matchVoteToParams,
                            ...AggregateLogic.voteInCommon,
                            {
                                '$match': {
                                    'user': new ObjectId(AuthUser?._id),
                                    'isDirect': true,
                                    'position': { $ne: null }
                                }
                            },
                            ...AggregateLogic.representeeVotes,
                            ...AggregateLogic.sortLogic,
                            ...AggregateLogic.questionStats,
                            ...AggregateLogic.userObject
                        ])
                        .toArray(),
                }[type]();
            })(type);

            console.log({
                singleQuestions: Votes.filter(v => v.question.questionType === 'single') 
            });

            return Votes.map(v => ({
                ...v,
                question: {
                    ...v.question,
                    choices: v.question?.choices?.map(c => ({
                        ...c,
                        userVote: v.choiceVotes?.find(cv => cv.choiceText === c.text)?.yourVote
                    })),
                    userVote: v.yourVote
                }
            }));
        },
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group
        }, {
            mongoDB, AuthUser
        }) => {

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    // 'groupChannel.channel': channel,
                    user: new ObjectId(AuthUser?._id)
                });

            const Group_ = !!AuthUser && await mongoDB.collection("Groups")
                .findOne({
                    handle: group
                });

            const savedVote = (!!AuthUser && !Vote_) ?
                (await mongoDB.collection("Votes").insertOne({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group },
                    'position': Vote.position,
                    'forWeight': Vote.position === 'for' ? 1 : 0,
                    'againstWeight': Vote.position === 'against' ? 1 : 0,
                    'isDirect': true,
                    'representatives': [],

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                    'user': AuthUser._id
                }))?.ops[0] : (
                    !!AuthUser &&
                    Vote.position === null &&
                    Vote_.user.toString() === AuthUser._id.toString()
                ) ? (
                    await mongoDB.collection("Votes").findOneAndUpdate(
                        { _id: Vote_._id },
                        {
                            $set: {
                                'position': Vote_.representatives.length === 0 ? null : 'delegated',
                                'forWeight': Vote_.representatives.length === 0 ? 0 :
                                    (Vote_.representatives.reduce(
                                        (acc, curr) => acc + curr.forWeight, 0
                                    ) / Vote_.representatives.length) || 0,
                                'againstWeight': Vote_.representatives.length === 0 ? 0 :
                                    (Vote_.representatives.reduce(
                                        (acc, curr) => acc + curr.againstWeight, 0
                                    ) / Vote_.representatives.length) || 0,
                                'isDirect': Vote_.representatives.length === 0 ? true : false,
                                'lastEditOn': Date.now(),
                            },
                        },
                        { returnDocument: 'after' }
                    )
                )?.value : (
                    !!AuthUser &&
                    Vote_.user.toString() === AuthUser._id.toString()
                ) ? (
                    await mongoDB.collection("Votes").findOneAndUpdate(
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
                        { returnDocument: 'after' }
                    )
                )?.value : null;

            const representeesAndVote = !!AuthUser && (await mongoDB.collection("UserRepresentations")
                .aggregate([{
                    $match: {
                        representativeId: new ObjectId(AuthUser._id),
                        groupId: new ObjectId(Group_._id),
                        isRepresentingYou: true
                    }
                }, {
                    $lookup: {
                        from: 'Votes',
                        let: {
                            representee: "$representeeId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    questionText,
                                    choiceText,
                                    'groupChannel.group': group,
                                    // 'groupChannel.channel': channel,
                                    $expr: {
                                        $eq: [
                                            "$user",
                                            { "$toObjectId": "$$representee" }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'Vote'
                    }
                }])
                .toArray()
            );

            const updatedRepresenteesVotes = !!representeesAndVote && await Promise.all(representeesAndVote?.map(async (r) => {
                return !r.Vote.length ?
                    (await mongoDB.collection("Votes").insertOne({
                        'questionText': questionText,
                        'choiceText': choiceText,
                        'groupChannel': { group },
                        'position': 'delegated',
                        'forWeight': Vote.position === 'for' ? 1 : 0,
                        'againstWeight': Vote.position === 'against' ? 1 : 0,
                        'isDirect': false,
                        'representatives': [{
                            'representativeId': AuthUser._id,
                            'representativeHandle': AuthUser.LiquidUser.handle,
                            'representativeAvatar': AuthUser.LiquidUser.avatar,
                            'representativeName': AuthUser.LiquidUser.name,
                            'position': Vote.position,
                            'forWeight': Vote.position === 'for' ? 1 : 0,
                            'againstWeight': Vote.position === 'against' ? 1 : 0,
                            'lastEditOn': Date.now(),
                            'createdOn': Date.now(),
                        }],
                        'lastEditOn': Date.now(),
                        'createdOn': Date.now(),
                        'createdBy': AuthUser.LiquidUser.handle,
                        'user': r.representeeId
                    }))?.ops[0] : (async () => {

                        const Vote_ = r.Vote[0];
                        const isDirect = Vote_?.isDirect;
                        const userRepresentativeVote_ = Vote_?.representatives?.find(
                            v => v.representativeHandle === AuthUser.LiquidUser.handle
                        );

                        const representativesToUpdate = Vote_.representatives.reduce(
                            (acc, curr) => [
                                ...acc,
                                // removes previous representative object
                                ...(curr.representativeHandle !== AuthUser.LiquidUser.handle) ? [curr] : []
                            ],
                            [{
                                'representativeId': AuthUser._id,
                                'representativeHandle': AuthUser.LiquidUser.handle,
                                'representativeAvatar': AuthUser.LiquidUser.avatar,
                                'representativeName': AuthUser.LiquidUser.name,
                                'position': Vote.position,
                                'forWeight': Vote.position === 'for' ? 1 : 0,
                                'againstWeight': Vote.position === 'against' ? 1 : 0,
                                'lastEditOn': Date.now(),
                                'createdOn': userRepresentativeVote_?.createdOn || Date.now(),
                            }]
                        );

                        return (await mongoDB.collection("Votes").findOneAndUpdate(
                            { _id: Vote_._id },
                            {
                                $set: {
                                    'position': isDirect ? Vote_.position : 'delegated',
                                    'forWeight': isDirect ? Vote_.forWeight :
                                        (representativesToUpdate.reduce(
                                            (acc, curr) => acc + curr.forWeight, 0
                                        ) / representativesToUpdate.length) || 0,
                                    'againstWeight': isDirect ? Vote_.againstWeight :
                                        (representativesToUpdate.reduce(
                                            (acc, curr) => acc + curr.againstWeight, 0
                                        ) / representativesToUpdate.length) || 0,
                                    'representatives': representativesToUpdate,
                                    'lastEditOn': Date.now(),
                                },
                            },
                            { returnDocument: 'after' }
                        ))?.value
                    })()
            }));

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                // channel,
                mongoDB,
                AuthUser
            });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes: updatedRepresenteesVotes
            };
        },
    },
};