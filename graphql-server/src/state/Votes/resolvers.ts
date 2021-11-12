import { ObjectId } from 'mongodb';

import { updateQuestionVotingStats } from '../Questions/resolvers';
import { getUserStats } from '../Users/resolvers';

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
        VotesTest: async (_source, { args }, { mongoDB, AuthUser }) => {

            // check poll stats against Votes

            // check user stats against Votes
            const users = await mongoDB.collection("Users").find().toArray();
            const usersWithStats = await Promise.all(users.map(async (u) => ({
                ...u,
                stats: await getUserStats({ userId: u._id, mongoDB })
            })));
            const usersVoteQueryStats = await Promise.all(usersWithStats.map(async (u: any) => ({
                ...u,
                voteQueryStats: {
                    directVotesMade: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'directVotesMade',
                        sortBy: null,
                    }, { mongoDB, AuthUser })).length,
                    indirectVotesMadeByUser: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'indirectVotesMade',
                        sortBy: null,
                    }, { mongoDB, AuthUser })).length,
                    indirectVotesMadeForUser: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'indirectVotesMadeForUser',
                        sortBy: null,
                    }, { mongoDB, AuthUser })).length,
                }
            })));

            console.log({ usersVoteQueryStats: usersVoteQueryStats?.length })
            // check group stats against Votes


            return {
                users: usersVoteQueryStats?.map((u: any) => ({
                    handle: u?.LiquidUser?.handle,
                    stats: u?.stats,
                    voteQueryStats: u?.voteQueryStats
                }))
            }
        }
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) { return };

            // const question = await mongoDB.collection("Questions").findOne({
            //     questionText,
            //     'groupChannel.group': group,
            //     choiceText
            // });

            const Group_ = !!AuthUser && await mongoDB.collection("Groups")
                .findOne({
                    handle: group
                });

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    // 'groupChannel.channel': channel,
                    user: new ObjectId(AuthUser?._id)
                });

            const savedVote = !!AuthUser && (await mongoDB.collection("Votes")
                .findOneAndUpdate({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group },
                    user: new ObjectId(AuthUser?._id)
                }, {
                    $set: {
                        'position': Vote.position,
                        'forWeight': Vote.position === 'for' ? 1 : 0,
                        'againstWeight': Vote.position === 'against' ? 1 : 0,
                        'isDirect': true,
                        ...(Vote?.position === null) ? {
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
                        } : {
                            'position': Vote.position,
                            'forWeight': Vote.position === 'for' ? 1 : 0,
                            'againstWeight': Vote.position === 'against' ? 1 : 0,
                            'isDirect': true,
                            'representatives': [],
                        },
                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        'questionText': questionText,
                        'choiceText': choiceText,
                        'groupChannel': { group },
                        'createdOn': Date.now(),
                        'createdBy': AuthUser._id,
                        'user': AuthUser._id
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            const representeeVotes = await updateRepresenteesVote({
                efficientOrThorough: "thorough",
                // efficient - gets other representatives from a previously calculated list
                // thorough - gets other representatives from a query

                representativeId: AuthUser._id,
                isRepresentingYou: true, // false, for when removing vote
                groupId: Group_._id,
                groupHandle: group,
                questionText,
                choiceText,
                representativeVote: savedVote,

                AuthUser,
                mongoDB,
            });

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                // channel,
                mongoDB,
                AuthUser
            });

            // Update User Stats
            // Update Group Stats
            // Update Tags Stats

            console.log({
                savedVote,
                representeeVotes
            });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes
            };
        },
    },
};

export const updateRepresenteesVote = async ({
    efficientOrThorough = "efficient",
    // efficient - gets other representatives from a previously calculated list
    // thorough - gets other representatives from a query

    representativeId,
    isRepresentingYou, // false, for when removing vote
    groupId,
    groupHandle,
    questionText,
    choiceText,
    representativeVote,

    AuthUser,
    mongoDB,
}) => {

    const representeesAndVote = !!representativeId && (
        await mongoDB.collection("UserRepresentations")
            .aggregate([{
                $match: {
                    representativeId: new ObjectId(representativeId),
                    // OR
                    groupId: new ObjectId(groupId),
                    // OR
                    // TAGS
                    isRepresentingYou
                }
            },
            // TODO: Ensure no repeat representatives (from group and tag(s))
            {
                $lookup: {
                    as: 'Vote',
                    from: 'Votes',
                    let: {
                        representee: "$representeeId"
                    },
                    pipeline: [
                        {
                            $match: {
                                questionText,
                                choiceText,
                                'groupChannel.group': groupHandle,
                                $expr: {
                                    $eq: [
                                        "$user",
                                        { "$toObjectId": "$$representee" }
                                    ]
                                },
                                // isDirect: false
                                // save for even if direct,
                                // so that if representee changes to null
                                // we already have the representatives
                            }
                        },
                        ...(efficientOrThorough === 'thorough') ? [{
                            $lookup: {
                                as: 'representatives',
                                from: 'UserRepresentations',
                                let: {
                                    representee: "$$representee"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: [
                                                    "$representeeId",
                                                    { "$toObjectId": "$$representee" }
                                                ]
                                            },
                                            groupId: ObjectId(groupId),
                                            isRepresentingYou: true
                                        }
                                    },
                                    {
                                        $lookup: {
                                            as: 'vote',
                                            from: 'Votes',
                                            let: {
                                                representativeId: "$representativeId"
                                            },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        questionText,
                                                        choiceText,
                                                        'groupChannel.group': groupHandle,
                                                        $expr: {
                                                            $eq: [
                                                                "$user",
                                                                { "$toObjectId": "$$representativeId" }
                                                            ]
                                                        }
                                                    }
                                                },
                                                {
                                                    $addFields: {
                                                        representativeId: "$$representativeId"
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $replaceRoot: {
                                            newRoot: {
                                                '$first': '$vote',
                                            }
                                        }
                                    }
                                ],
                            }
                        }] : []
                    ]
                }
            }])
            .toArray()
    );

    const updatedRepresenteesVotes = !!representeesAndVote &&
        await Promise.all(representeesAndVote?.map(async (r) => {

            const RepresenteeVote = r?.Vote?.[0];

            const representativeVote_ = efficientOrThorough === 'thorough' ?
                RepresenteeVote?.representatives?.find(
                    v => v.representativeId.toString() === representativeId.toString()
                ) :
                representativeVote;

            const representativesToUpdate = (
                !!RepresenteeVote?.representatives ? RepresenteeVote?.representatives : []
            )?.reduce(
                (acc, curr) => [
                    ...acc,
                    // removes previous representative object
                    ...(
                        curr.representativeId.toString() !== representativeId.toString()
                    ) ? [curr] : []
                ],
                [
                    ...(isRepresentingYou) ? [{
                        'representativeId': representativeId,
                        'position': representativeVote_.position,
                        'forWeight': representativeVote_.forWeight,
                        'againstWeight': representativeVote_.againstWeight,
                        'lastEditOn': Date.now(),
                        'createdOn': representativeVote_?.createdOn || Date.now(),
                    }] : []
                ]
            );

            console.log({
                representativesToUpdate
            });

            const dbDoc = !!AuthUser && (await mongoDB.collection("Votes")
                .findOneAndUpdate({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group: groupHandle },
                    'user': new ObjectId(r.representeeId)
                }, {
                    $set: {
                        'position': RepresenteeVote?.isDirect ? RepresenteeVote.position : 'delegated',
                        'forWeight': RepresenteeVote?.isDirect ? RepresenteeVote.forWeight :
                            (representativesToUpdate.reduce(
                                (acc, curr) => acc + curr.forWeight, 0
                            ) / representativesToUpdate.length) || 0,
                        'againstWeight': RepresenteeVote?.isDirect ? RepresenteeVote.againstWeight :
                            (representativesToUpdate.reduce(
                                (acc, curr) => acc + curr.againstWeight, 0
                            ) / representativesToUpdate.length) || 0,
                        'representatives': representativesToUpdate,

                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        'questionText': questionText,
                        'choiceText': choiceText,
                        'groupChannel': { group: groupHandle },
                        'user': new ObjectId(r.representeeId),
                        createdOn: Date.now()
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            return dbDoc;
        }));

    return updatedRepresenteesVotes;
};



// update representeeVote for vote
// update representeeVotes for vote representative votes

// update representeeVotes by representative //for debug
// update representeeVotes by representatee //for debug