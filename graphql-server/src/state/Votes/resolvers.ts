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
        Votes: async (_source, { handle, handleType = 'user', type = 'directVotesMade' }, { mongoDB, s3, AuthUser }) => {

            const User = handleType === 'user' && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            // const Group = handleType === 'group' && await mongoDB.collection("Groups")
            //     .findOne({ 'handle': handle });

            const votesInCommonGeneralAggregationLogic = (
                [{
                    '$match': {
                        ...(handleType === 'user') && {
                            'user': ObjectID(User._id)
                        },
                        ...(handleType === 'group') && {
                            'groupChannel.group': handle
                        }
                    }
                }, {
                    '$lookup': {
                        'from': 'Votes',
                        'let': {
                            'userId': ObjectID(AuthUser._id),
                            'questionText': '$questionText',
                            'choiceText': '$choiceText',
                            'group': '$groupChannel.group',
                            'channel': '$groupChannel.channel'
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
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$groupChannel.group', '$$group'
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$groupChannel.channel', '$$channel'
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        'as': 'yourVote'
                    }
                }, {
                    '$match': {
                        'yourVote': {
                            '$gte': {
                                '$size': 1
                            }
                        }
                    }
                }, {
                    '$addFields': {
                        'yourVote': {
                            '$first': '$yourVote'
                        }
                    }
                }, {
                    '$addFields': {
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
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$yourVote.representatives',
                                            'as': 'r',
                                            'cond': {
                                                '$eq': [
                                                    '$$r.representativeId', '$user'
                                                ]
                                            }
                                        }
                                    }
                                }, 1
                            ]
                        },
                        'yourVoteMadeForUser': {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$representatives',
                                            'as': 'r',
                                            'cond': {
                                                '$eq': [
                                                    '$$r.representativeId', '$yourVote.user'
                                                ]
                                            }
                                        }
                                    }
                                }, 1
                            ]
                        }
                    }
                },
                ]
            );

            const representeeVotesAggregationLogic = (
                [
                    {
                        '$lookup': {
                            'from': 'Votes',
                            'let': {
                                'representativeId': { '$toObjectId' : '$user' },
                                'questionText': '$questionText',
                                'choiceText': '$choiceText',
                                'group': '$groupChannel.group',
                                'channel': '$groupChannel.channel'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$and': [
                                            { 'isDirect': false },
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
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$groupChannel.channel', '$$channel'
                                                    ]
                                                }
                                            }
                                        ]
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
                    }
                ]
            );

            const questionStatsAggregationLogic = (
                [
                    {
                        $lookup: {
                            from: 'Questions',
                            let: {
                                questionText: "$questionText",
                                choiceText: "$choiceText",
                                group: "$group",
                                channel: "$channel"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        // "questionText": "$$questionText",
                                        // not null
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
                                                        '$group', '$$group'
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$channel', '$$channel'
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
                            QuestionStats: { $first: '$question.stats' }
                        }
                    },
                    ...(handleType !== 'user') ? [{
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
                    }] : []
                ]
            );

            const Votes = await (async (type) => {
                return {
                    'directVotesMade': async () => await mongoDB.collection("Votes")
                        // .find({ 'user': ObjectID(User?._id), 'isDirect': true })
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'isDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'directVotesInAgreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'InAgreement': true,
                                    'bothDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'directVotesInDisagreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'InAgreement': false,
                                    'bothDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeForUser': async () => await mongoDB.collection("Votes")
                        // .find({ 'user': ObjectID(User?._id), 'isDirect': false })
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'isDirect': false
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeByYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'yourVoteMadeForUser': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeForYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'yourVoteMadeByUser': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                }[type]();
            })(type);

            return Votes;
        },
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group, channel
        }, {
            mongoDB, s3, AuthUser
        }) => {

            console.log({
                questionText, choiceText
            });

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel,
                    user: ObjectID(AuthUser?._id)
                });

            const Group_ = !!AuthUser && await mongoDB.collection("Groups")
                .findOne({
                    handle: group
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
                        {
                            returnNewDocument: true,
                            returnOriginal: false
                        }
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
                        {
                            returnNewDocument: true,
                            returnOriginal: false
                        }
                    )
                )?.value : null;

            const representeesAndVote = !!AuthUser && (await mongoDB.collection("UserRepresentations")
                .aggregate([{
                    $match: {
                        representativeId: ObjectID(AuthUser._id),
                        groupId: ObjectID(Group_._id),
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
                                    'groupChannel.channel': channel,
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
                        'groupChannel': { group, channel },
                        'position': Vote.position,
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
                        'user': r.representeeId // ⚠️ huuuuum - id, should be handle. but handle not great
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
                            {
                                returnNewDocument: true,
                                returnOriginal: false
                            }
                        ))?.value
                    })()
            }));

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                channel,
                mongoDB,
                AuthUser
            });

            // console.log({

            // })


            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes: updatedRepresenteesVotes
            };
        },
    },
};