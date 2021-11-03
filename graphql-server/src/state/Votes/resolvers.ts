import { ObjectId } from 'mongodb';

import { updateQuestionVotingStats } from '../Questions/resolvers';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, AuthUser }) => {

            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?._id,
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

            // console.log({
            //     questionText,
            //     choiceText,
            //     groupHandle,
            //     userHandle,
            //     type,
            //     sortBy,
            //     you: AuthUser?._id
            // });

            const AggregateLogic = {
                matchVoteToParams: (
                    [
                        {
                            '$match': {
                                ...(!!questionText) && {
                                    'questionText': questionText
                                },
                                // ...(!!choiceText) && {
                                //     'choiceText': choiceText
                                // },
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
                yourVoteAndBooleans: (
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
                                },
                                'userVote': '$$ROOT',
                            }
                        }, {
                            '$addFields': {
                                'youAndUserDetails': {
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
                                                    '$isDirect', true
                                                ]
                                            },
                                            {
                                                '$eq': [
                                                    '$yourVote.isDirect', true
                                                ]
                                            },
                                            {
                                                '$eq': [
                                                    '$position', '$yourVote.position'
                                                ]
                                            }
                                        ]
                                    },
                                    'InDisagreement': {
                                        '$and': [
                                            {
                                                '$eq': [
                                                    '$isDirect', true
                                                ]
                                            },
                                            {
                                                '$eq': [
                                                    '$yourVote.isDirect', true
                                                ]
                                            },
                                            {
                                                '$ne': [
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
                                                                        '$$r.representativeId', ObjectId('60ba506d2e7efed1c46e1837')
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
                            }
                        },
                    ]
                ),
                removeRepresentativesIfNotDelegated: (
                    [{
                        '$addFields': {
                            representatives: {
                                $cond: [
                                    { $eq: ["$position", "delegated"] },
                                    {
                                        '$filter': {
                                            'input': '$representatives',
                                            'as': 'r',
                                            'cond': {
                                                '$ne': [
                                                    '$$r.position', null
                                                ]
                                            }
                                        }
                                    },
                                    []
                                ]
                            }
                        }
                    }]
                ),
                representativeUsers: (
                    [
                        {
                            '$unwind': {
                                'path': '$representatives',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$lookup': {
                                'from': 'Users',
                                'localField': 'representatives.representativeId',
                                'foreignField': '_id',
                                'as': 'representativeUser'
                            }
                        }, {
                            '$addFields': {
                                'representativeUser': {
                                    '$first': '$representativeUser.LiquidUser'
                                }
                            }
                        }, {
                            '$addFields': {
                                'representatives.representativeHandle': '$representativeUser.handle',
                                'representatives.representativeName': '$representativeUser.name',
                                'representatives.representativeAvatar': '$representativeUser.avatar'
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$user',
                                    'questionText': '$questionText',
                                    'choiceText': '$choiceText',
                                    'groupChannel': '$groupChannel'
                                },
                                'questionText': { '$first': '$questionText' },
                                'choiceText': { '$first': '$choiceText' },
                                'groupChannel': { '$first': '$groupChannel' },
                                'lastEditOn': { '$first': '$lastEditOn' },
                                'userVote': { '$first': '$userVote' },
                                'yourVote': { '$first': '$yourVote' },
                                'youAndUserDetails': { '$first': '$youAndUserDetails' },
                                'representatives': { '$push': '$representatives' },
                                'user': { '$first': '$user' },
                            }
                        }, {
                            '$addFields': {
                                'representatives': {
                                    '$filter': {
                                        'input': '$representatives',
                                        'as': 'r',
                                        'cond': {
                                            "$gt": ["$$r", {}]
                                        }
                                    }
                                }
                            }
                        }, {
                            '$addFields': {
                                'userVote.representatives': '$representatives'
                            }
                        }
                    ]
                ),
                representeeVotes: (
                    [
                        {
                            '$lookup': {
                                'as': 'representeeVotes',
                                'from': 'Votes',
                                'let': {
                                    'representativeId': { '$toObjectId': '$user' },
                                    'questionText': '$questionText',
                                    'choiceText': '$choiceText',
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
                                ]
                            }
                        },
                        {
                            '$addFields': {
                                'representeeCount': { $size: "$representeeVotes" },
                                'userVote.representeeVotes': '$representeeVotes'
                            }
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
                                    // no `choiceText`
                                    'user': '$user',
                                    'questionText': '$questionText',
                                    'groupChannel': '$groupChannel'
                                },
                                'questionText': { '$first': '$questionText' },
                                'groupChannel': { '$first': '$groupChannel' },
                                'choiceVotes': {
                                    '$push': {
                                        'userVote': '$userVote',
                                        'yourVote': '$yourVote'
                                    }
                                },
                                'lastEditOn': { '$last': '$lastEditOn' },
                                'representeeVotes': { '$push': '$representeeVotes' },
                                'representatives': { '$push': '$representatives' },
                                'user': { '$first': '$user' },
                                // for single questions
                                'yourVote': { '$first': '$yourVote' },
                                'userVote': { '$first': '$userVote' },
                                // stats
                                'youAndUserDetails': { '$first': '$youAndUserDetails' },
                                // stats counts
                                'youAndUserDetailsCounts_bothDirect': {
                                    '$sum': {
                                        $cond: ['$youAndUserDetails.bothDirect', 1, 0]
                                    }
                                },
                                'youAndUserDetailsCounts_InAgreement': {
                                    '$sum': {
                                        $cond: ['$youAndUserDetails.InAgreement', 1, 0]
                                    }
                                },
                                'youAndUserDetailsCounts_InDisagreement': {
                                    '$sum': {
                                        $cond: ['$youAndUserDetails.InDisagreement', 1, 0]
                                    }
                                },
                                'youAndUserDetailsCounts_yourVoteMadeByUser': {
                                    '$sum': {
                                        $cond: ['$youAndUserDetails.yourVoteMadeByUser', 1, 0]
                                    }
                                },
                                'youAndUserDetailsCounts_yourVoteMadeForUser': {
                                    '$sum': {
                                        $cond: ['$youAndUserDetails.yourVoteMadeForUser', 1, 0]
                                    }
                                },
                                'Count_directFor': {
                                    '$sum': {
                                        "$switch": {
                                            "branches": [
                                                {
                                                    "case": { '$eq': ["$userVote.position", 'for'] },
                                                    "then": 1
                                                }
                                            ],
                                            "default": 0
                                        }
                                    }
                                },
                                'Count_direct': {
                                    '$sum': {
                                        $cond: ['$userVote.isDirect', 1, 0]
                                    }
                                },
                                'Count_delegated': {
                                    '$sum': {
                                        "$switch": {
                                            "branches": [
                                                {
                                                    "case": { '$eq': ["$userVote.position", 'delegated'] },
                                                    "then": 1
                                                }
                                            ],
                                            "default": 0
                                        }
                                    }
                                },
                                'Count_directAgainst': {
                                    '$sum': {
                                        "$switch": {
                                            "branches": [
                                                {
                                                    "case": { '$eq': ["$userVote.position", 'against'] },
                                                    "then": 1
                                                }
                                            ],
                                            "default": 0
                                        }
                                    }
                                },
                            }
                        }, {
                            '$addFields': {
                                youAndUserDetailsCount: {
                                    bothDirect: '$youAndUserDetailsCounts_bothDirect',
                                    InAgreement: '$youAndUserDetailsCounts_InAgreement',
                                    InDisagreement: '$youAndUserDetailsCounts_InDisagreement',
                                    yourVoteMadeByUser: '$youAndUserDetailsCounts_yourVoteMadeByUser',
                                    yourVoteMadeForUser: '$youAndUserDetailsCounts_yourVoteMadeForUser'
                                },
                                Count: {
                                    directFor: '$Count_directFor',
                                    direct: '$Count_direct',
                                    delegated: '$Count_delegated',
                                    directAgainst: '$Count_directAgainst',
                                }
                            }
                        }
                    ]
                ),
                mergedChoicesUniqueRepresentees: (
                    [
                        {
                            '$unwind': {
                                'path': '$representeeVotes',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$unwind': {
                                'path': '$representeeVotes',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel',
                                    'representeeHandle': '$representeeVotes.user.handle'
                                },
                                'root': {
                                    '$first': '$$ROOT'
                                }
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    // no `choiceText`
                                    // no 'representeeHandle`
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel'
                                },
                                'questionText': { '$first': '$root.questionText' },
                                'groupChannel': { '$first': '$root.groupChannel' },
                                'choiceVotes': { '$first': '$root.choiceVotes' },
                                'lastEditOn': { '$first': '$root.lastEditOn' },
                                'representeeVotes': { '$push': '$root.representeeVotes' },
                                'representatives': { '$first': '$root.representatives' },
                                'user': { '$first': '$root.user' },
                                'yourVote': { '$first': '$root.yourVote' },
                                'userVote': { '$first': '$root.userVote' },
                                'youAndUserDetailsCount': { '$first': '$root.youAndUserDetailsCount' },
                                'Count': { '$first': '$root.Count' },
                            }
                        }
                    ]
                ),
                mergedChoicesUniqueRepresentatives: (
                    [
                        {
                            '$unwind': {
                                'path': '$representatives',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$unwind': {
                                'path': '$representatives',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$group': {
                                '_id': {
                                    // no `choiceText`
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
                                    // no `choiceText`
                                    // no 'representativeHandle`
                                    'user': '$_id.user',
                                    'questionText': '$_id.questionText',
                                    'groupChannel': '$_id.groupChannel'
                                },
                                'questionText': { '$first': '$root.questionText' },
                                'groupChannel': { '$first': '$root.groupChannel' },
                                'choiceVotes': { '$first': '$root.choiceVotes' },
                                'lastEditOn': { '$first': '$root.lastEditOn' },
                                'representeeVotes': { '$first': '$root.representeeVotes' },
                                'representatives': { '$push': '$root.representatives' },
                                'user': { '$first': '$root.user' },
                                'yourVote': { '$first': '$root.yourVote' },
                                'userVote': { '$first': '$root.userVote' },
                                'youAndUserDetailsCount': { '$first': '$root.youAndUserDetailsCount' },
                                'Count': { '$first': '$root.Count' },
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
                        {
                            '$addFields': {
                                'representeeVotesCount': { '$size': "$representeeVotes" }
                            }
                        },
                        ...(sortBy === 'weight') ? [
                            {
                                '$sort': { representeeVotesCount: -1 }
                            }
                        ] : [],
                        ...(sortBy === 'time') ? [
                            {
                                '$sort': { lastEditOn: -1 }
                            }
                        ] : []
                    ]
                ),
                matchChoiceParam: (choiceFilters: any = false) => (
                    [
                        ...(!!choiceText) ? [
                            {
                                '$addFields': {
                                    hasChoiceVote: {
                                        '$gte': [
                                            {
                                                '$size': {
                                                    '$filter': {
                                                        'input': '$choiceVotes',
                                                        'as': 'v',
                                                        'cond': {
                                                            '$and': [
                                                                {
                                                                    '$eq': [
                                                                        '$$v.userVote.choiceText', choiceText
                                                                    ]
                                                                },
                                                                ...(!!choiceFilters) ? [
                                                                    ...choiceFilters
                                                                ] : []
                                                            ]
                                                        }
                                                    }
                                                }
                                            }, 1
                                        ]
                                    }
                                }
                            }, {
                                '$match': {
                                    hasChoiceVote: true
                                }
                            }
                        ] : []
                    ]
                )
            }

            const defaultAggregation = async ({
                filterAfterYourVoteAndBooleans = false,
                filterAfterMerge = false,
                choiceFilters = false
            }: any) => await mongoDB.collection("Votes")
                .aggregate([
                    ...AggregateLogic.matchVoteToParams,
                    ...AggregateLogic.removeRepresentativesIfNotDelegated,
                    ...AggregateLogic.yourVoteAndBooleans,
                    ...!!filterAfterYourVoteAndBooleans ? [
                        ...filterAfterYourVoteAndBooleans
                    ] : [],
                    ...AggregateLogic.representativeUsers,
                    ...AggregateLogic.representeeVotes,
                    ...AggregateLogic.mergedChoices,
                    ...AggregateLogic.mergedChoicesUniqueRepresentatives,
                    ...AggregateLogic.mergedChoicesUniqueRepresentees,
                    ...!!filterAfterMerge ? [
                        ...filterAfterMerge
                    ] : [],
                    ...AggregateLogic.matchChoiceParam(choiceFilters),
                    ...AggregateLogic.sortLogic,
                    ...AggregateLogic.question,
                    ...AggregateLogic.userObject
                ])
                .toArray();

            const Votes = await (async (type) => {
                return {
                    'all': async () => await defaultAggregation({}),
                    'for': async () => await defaultAggregation({
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.position', 'for'
                            ]
                        }]
                    }),
                    'against': async () => await defaultAggregation({
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.position', 'against'
                            ]
                        }]
                    }),
                    'directFor': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'position': 'for',
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.directFor': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }, {
                            '$eq': [
                                '$$v.userVote.position', 'for'
                            ]
                        }]
                    }),
                    'directAgainst': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'position': 'against',
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.directAgainst': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }, {
                            '$eq': [
                                '$$v.userVote.position', 'against'
                            ]
                        }]
                    }),
                    'directVotesMade': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.direct': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }]
                    }),
                    'directVotesInAgreement': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'youAndUserDetails.InAgreement': true,
                                // 'youAndUserDetails.bothDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.InAgreement': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }]
                    }),
                    'directVotesInDisagreement': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // TODO: Get disagreement count
                                // 'youAndUserDetails.InAgreement': false,
                                // 'youAndUserDetails.bothDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.InDisagreement': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }]
                    }),
                    'indirectVotesMade': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // position: "delegated",
                                // isDirect: false
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.delegated': { $gt: 0 }
                            }
                        }]
                    }),
                    'indirectVotesMadeForUser': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // position: "delegated",
                                // isDirect: false
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.delegated': { $gt: 0 }
                            }
                        }]
                    }),
                    // huuuuuuuum
                    // 'indirectVotesMadeByUser': 
                    'indirectVotesMadeByYou': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'youAndUserDetails.yourVoteMadeForUser': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.yourVoteMadeForUser': { $gt: 0 }
                            }
                        }]
                    }),
                    'indirectVotesMadeForYou': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                //     'youAndUserDetails.yourVoteMadeByUser': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.yourVoteMadeByUser': { $gt: 0 }
                            }
                        }]
                    }),
                    'directVotesMadeByYou': async () => await defaultAggregation({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                'user': new ObjectId(AuthUser?._id), // stays
                                // 'isDirect': true,
                                // 'position': { $ne: null }
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.direct': { $gt: 0 }
                            }
                        }]
                    }),
                }[type]();
            })(type);

            console.log({
                type,
                VotesL: Votes?.length,
                // Vote: Votes?.[0]?.choiceVotes
                // Votes: JSON.stringify(Votes.map(v => ({
                //     c: v.youAndUserDetailsCount
                // }))),
                // v: JSON.stringify(Votes.map(v => ({
                //     r: v.representatives
                //     // g: v.question?.groupChannel?.group
                // })), null, 2)
                // singleQuestions: Votes.filter(v => v.question.questionType === 'single')
            });

            return Votes.map(v => ({
                // _id: Math.random()*1000000,
                ...v,

                // get `yourVote`s into `question` and `question.choices`
                question: {
                    ...v.question,
                    _id: `choiceaggregate_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                    choices: v.question?.choices?.map(c => ({
                        ...c,
                        userVote: !!v.choiceVotes?.find(cv => cv.userVote?.choiceText === c.text)?.userVote ? ({
                            ...v.choiceVotes?.find(cv => cv.userVote.choiceText === c.text)?.userVote,
                            user: v.user,
                            groupChannel: v.groupChannel,
                            // _id: `userChoiceVote_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}_${c.text}`,
                        }) : null,
                        yourVote: !!v.choiceVotes?.find(cv => cv.userVote?.choiceText === c.text)?.yourVote ? ({
                            ...v.choiceVotes?.find(cv => cv.userVote.choiceText === c.text)?.yourVote,
                            user: AuthUser.LiquidUser,
                            groupChannel: v.groupChannel,
                            // _id: `yourVote_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}_${c.text}`,
                        }) : null
                    })),
                    yourVote: {
                        ...v.yourVote,
                        // _id: `yourVote_${type}_${questionText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                    },
                    userVote: {
                        ...v.userVote,
                        // _id: `userVote_${type}_${questionText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                    }
                },
                // _id: `choiceaggregate_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
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
                    'createdBy': AuthUser._id,
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
                        'createdBy': AuthUser._id,
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
                                    // 'lastEditOn': Date.now(),
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

            // console.log({
            //     savedVote
            // });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes: updatedRepresenteesVotes
            };
        },
    },
};

// update representeeVotes by representee and representative
// update representeeVotes by vote and representative

// update representeeVotes by representative //for debug
// update representeeVotes by representatee //for debug