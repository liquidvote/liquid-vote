import { ObjectId } from 'mongodb';

import { canViewUsersVoteOrCause } from "../ViewingPermission/aggregationLogic";

export const VotersAgg = ({
    questionText,
    choiceText,
    groupHandle,
    userHandle,
    User,
    AuthUser,
    sortBy
}) => ({
    matchVoteToParams: (
        [
            {
                '$match': {
                    "$and": [
                        ...(!!questionText) ? [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$questionText", questionText
                                    ]
                                }
                            }
                        ] : [],

                        ...(!!userHandle) ? [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$user",
                                        {
                                            "$toObjectId": new ObjectId(User._id)
                                        }
                                    ]
                                }
                            }
                        ] : [],

                        ...(!!groupHandle) ? [
                            {
                                "$expr": {
                                    "$eq": [
                                        "$groupChannel.group", groupHandle
                                    ]
                                }
                            }
                        ] : [],

                        {
                            "$expr": {
                                "$ne": [
                                    "$position", null
                                ]
                            }
                        }

                    ]
                }
            }
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
    yourVoteAndBooleans: (
        [
            {
                '$lookup': {
                    'as': 'yourVote',
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
                                    ] : [],
                                ]
                            }
                        }
                    ]
                }
            },
            {
                '$addFields': {
                    'yourVote': {
                        '$first': '$yourVote'
                    },
                    'userVote': '$$ROOT',
                }
            },
            {
                '$addFields': {
                    'youAndUserDetails': {
                        'bothDirect': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$userVote.isDirect', true
                                    ]
                                }, {
                                    '$eq': [
                                        '$yourVote.isDirect', true
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$yourVote.choiceText', choiceText
                                    ]
                                }
                            ]
                        },
                        'InAgreement': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$userVote.isDirect', true
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$yourVote.isDirect', true
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$userVote.position', '$yourVote.position'
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$yourVote.choiceText', choiceText
                                    ]
                                }
                            ]
                        },
                        'InDisagreement': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$userVote.isDirect', true
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$yourVote.isDirect', true
                                    ]
                                },
                                {
                                    '$ne': [
                                        '$userVote.position', '$yourVote.position'
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$yourVote.choiceText', choiceText
                                    ]
                                }
                            ]
                        },
                        'yourVoteMadeByUser': {
                            $cond: {
                                // if: false,
                                if: {
                                    '$or': [
                                        { $not: ["$yourVote"] },
                                        { $ne: ["$yourVote.choiceText", choiceText] },
                                        { $ne: ["$userVote.isDirect", true] }
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
                                                                    '$$r.representativeId', '$userVote.user'
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
                                // if: false,
                                if: {
                                    '$or': [
                                        { $eq: ["$userVote.isDirect", true] },
                                        { $ne: ["$yourVote.choiceText", choiceText] },
                                        { $ne: ["$yourVote.isDirect", true] }
                                    ]
                                },
                                then: false,
                                else: {
                                    '$gte': [
                                        {
                                            '$size': {
                                                '$filter': {
                                                    'input': '$userVote.representatives',
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
                }
            },
        ]
    ),
    representativeUsersForYourVote: (
        [
            {
                '$unwind': {
                    'path': '$yourVote.representatives',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'yourVote.representatives.representativeId',
                    'foreignField': '_id',
                    'as': 'representativeUser'
                }
            }, {
                '$addFields': {
                    'your_representativeUser': {
                        '$first': '$representativeUser.LiquidUser'
                    }
                }
            }, {
                '$addFields': {
                    'yourVote.representatives.representativeHandle': '$your_representativeUser.handle',
                    'yourVote.representatives.representativeName': '$your_representativeUser.name',
                    'yourVote.representatives.representativeAvatar': '$your_representativeUser.avatar'
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
                    'yourVote_representatives': { '$push': '$yourVote.representatives' },
                    'user': { '$first': '$user' },
                }
            }, {
                '$addFields': {
                    'yourVote_representatives': {
                        '$filter': {
                            'input': '$yourVote_representatives',
                            'as': 'r',
                            'cond': {
                                "$gt": ["$$r", {}]
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'yourVote.representatives': '$yourVote_representatives'
                }
            }
        ]
    ),
    representativeUsersForUserVote: (
        [
            {
                '$unwind': {
                    'path': '$userVote.representatives',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'userVote.representatives.representativeId',
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
                    'userVote.representatives.representativeHandle': '$representativeUser.handle',
                    'userVote.representatives.representativeName': '$representativeUser.name',
                    'userVote.representatives.representativeAvatar': '$representativeUser.avatar',
                    'userVote.representatives.handle': '$representativeUser.handle',
                    'userVote.representatives.name': '$representativeUser.name',
                    'userVote.representatives.avatar': '$representativeUser.avatar'
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
                    'userVote_representatives': { '$push': '$userVote.representatives' },
                    'user': { '$first': '$user' },
                }
            }, {
                '$addFields': {
                    'userVote_representatives': {
                        '$filter': {
                            'input': '$userVote_representatives',
                            'as': 'r',
                            'cond': {
                                "$gt": ["$$r", {}]
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'userVote.representatives': '$userVote_representatives'
                }
            }
        ]
    ),
    representeeVotes: (
        [
            {
                '$lookup': {
                    'as': 'userVoteRepresenteeVotes',
                    'from': 'Votes',
                    'let': {
                        'representativeId': { '$toObjectId': '$userVote.user' },
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
                    'representeeCount': { $size: "$userVoteRepresenteeVotes" },
                    'userVote.representeeVotes': '$userVoteRepresenteeVotes'
                }
            }
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
                    "Count_representing": {
                        "$sum": {
                            "$switch": {
                                "branches": [{
                                    "case": {
                                        "$gt": [{ '$size': "$userVote.representeeVotes" }, 0]
                                    },
                                    "then": 1
                                }],
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
                        representing: "$Count_representing"
                    }
                }
            }
        ]
    ),
    mergedChoicesUniqueRepresentees: (
        [
            {
                '$unwind': {
                    'path': '$userVote.representeeVotes',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$unwind': {
                    'path': '$userVote.representeeVotes',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$group': {
                    '_id': {
                        'user': '$_id.user',
                        'questionText': '$_id.questionText',
                        'groupChannel': '$_id.groupChannel',
                        'representeeHandle': '$userVote.representeeVotes.user.handle'
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
                    'path': '$userVote.representatives',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$unwind': {
                    'path': '$userVote.representatives',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$group': {
                    '_id': {
                        // no `choiceText`
                        'user': '$_id.user',
                        'questionText': '$_id.questionText',
                        'groupChannel': '$_id.groupChannel',
                        'representativeId': '$userVote.representatives.representativeId'
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
                    // 'representeeVotes': { '$first': '$root.representeeVotes' },
                    'user': { '$first': '$root.user' },
                    'yourVote': { '$first': '$root.yourVote' },
                    'userVote': { '$first': '$root.userVote' },
                    'userVote_representatives': { '$push': '$root.userVote.representatives' },
                    'youAndUserDetailsCount': { '$first': '$root.youAndUserDetailsCount' },
                    'Count': { '$first': '$root.Count' },
                }
            },
            {
                '$addFields': {
                    'userVote.representatives': '$userVote_representatives'
                }
            }
        ]
    ),
    questionAndGroup: (
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
            },
            {
                $lookup: {
                    from: 'Groups',
                    localField: 'groupChannel.group',
                    foreignField: 'handle',
                    as: 'group'
                }
            }, {
                $addFields: {
                    'question.group': { $first: '$group' },
                    'group': { $first: '$group' }
                }
            }
        ]
    ),
    mergeQuestionAndChoiceVotes: ([
        {
            '$unwind': {
                'path': '$question.choices',
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            '$addFields': {
                'question.choices.yourVote': {
                    '$filter': {
                        'input': '$choiceVotes',
                        'as': 'c',
                        'cond': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$$c.yourVote.user', { "$toObjectId": AuthUser?._id }
                                    ],
                                },
                                {
                                    '$eq': [
                                        '$$c.yourVote.choiceText', "$question.choices.text"
                                    ]
                                }
                            ]
                        }
                    }
                },
                'question.choices.userVote': {
                    '$filter': {
                        'input': '$choiceVotes',
                        'as': 'c',
                        'cond': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$$c.userVote.user', { "$toObjectId": "$user" }
                                    ]
                                },
                                {
                                    '$eq': [
                                        '$$c.userVote.choiceText', "$question.choices.text"
                                    ]
                                }
                            ]
                        }
                    }
                },
            }
        },
        {
            '$lookup': {
                'as': 'yourVote_',
                'from': 'Votes',
                'let': {
                    'alreadyHasYourVote': {
                        "$size": "$question.choices.yourVote"
                    },
                    'userId': new ObjectId(AuthUser?._id),
                    'questionText': '$questionText',
                    'choiceText': '$question.choices.text',
                    'group': '$groupChannel.group',
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$lt': [
                                    '$$alreadyHasYourVote', 1
                                ]
                            }
                        },
                    },
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
                                }

                            ]
                        }
                    }
                ]
            }
        },
        {
            '$addFields': {
                'question.choices.yourVote': {
                    $cond: {
                        if: { $gt: [{ '$size': '$question.choices.yourVote.yourVote' }, 0] },
                        then: { '$first': '$question.choices.yourVote.yourVote' },
                        else: { '$first': '$yourVote_' }
                    }
                },
                'question.choices.userVote': { '$first': '$question.choices.userVote.userVote' },
            }
        },
        {
            '$group': {
                '_id': {
                    'user': '$user',
                    'questionText': '$questionText',
                    'groupChannel': '$groupChannel'
                },
                'questionText': { '$first': '$questionText' },
                'groupChannel': { '$first': '$groupChannel' },
                'choiceVotes': { '$first': '$choiceVotes' },
                'lastEditOn': { '$first': '$lastEditOn' },
                // 'representeeVotes': { '$first': '$representeeVotes' },
                'user': { '$first': '$user' },
                'yourVote': { '$first': '$yourVote' },
                'userVote': { '$first': '$userVote' },
                'youAndUserDetailsCount': { '$first': '$youAndUserDetailsCount' },
                'Count': { '$first': '$Count' },
                'question': { $first: '$question' },
                'group': { $first: '$group' },

                'question_choices': { '$push': '$question.choices' },
            }
        },
        {
            '$addFields': {
                'question.choices': '$question_choices'
            }
        },
    ]),
    addYourMemberRelationToGroup: ([
        {
            $addFields: {
                'question.group.yourMemberRelation': '$yourRel',
            }
        }
    ]),
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
                        $mergeObjects: [
                            { _id: { '$first': '$user._id' } },
                            { '$first': '$user.LiquidUser' }
                        ]
                    }
                }
            },
            {
                '$addFields': {
                    'userVote.user': {
                        $cond: { if: { $eq: ['$visibility.hasViewingPermission', true] }, then: '$user', else: null }
                    }
                }
            }
        ]
    ),
    sortLogic: (
        [
            ...(sortBy === 'weight') ? [
                {
                    '$addFields': {
                        'representeeVotesCount': { '$size': "$userVote.representeeVotes" }
                    }
                },
                {
                    '$sort': { representeeVotesCount: -1 }
                }
            ] : [],
            ...(sortBy === 'time') ? [
                ...userHandle ? [
                    {
                        $sort: {
                            'lastEditOn': -1,
                            'visibility.visibilityLevel': 1
                        }
                    }
                ] : [
                    {
                        '$sort': { 'lastEditOn': -1 }
                    },
                ],
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
    ),
    filterFollows: ([
        {
            '$lookup': {
                'as': 'isYouFollowing',
                'from': 'UserFollows',
                'let': {
                    'followedId': '$user._id',
                    'followingId': new ObjectId(AuthUser?._id),
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$followedId', {
                                                '$toObjectId': '$$followedId'
                                            }
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$followingId', {
                                                '$toObjectId': '$$followingId'
                                            }
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isFollowing', true
                                        ]
                                    }
                                },
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$match': {
                '$expr': {
                    '$gt': [
                        { "$size": "$isYouFollowing" }, 0
                    ]
                }
            }
        },
    ]),
});

export const VotesGeneralAggregateLogic = async ({
    filterAfterYourVoteAndBooleans = false,
    filterAfterMerge = false,
    choiceFilters = false,
    questionText,
    choiceText,
    groupHandle,
    userHandle,
    User,
    AuthUser,
    sortBy,
    followsOnly
}: any) => {

    // TODO check if viewer has access to group

    const AggregateLogic = VotersAgg({
        questionText,
        choiceText,
        groupHandle,
        userHandle,
        User,
        AuthUser,
        sortBy
    });

    return [
        ...AggregateLogic.matchVoteToParams,
        ...AggregateLogic.removeRepresentativesIfNotDelegated,
        ...AggregateLogic.yourVoteAndBooleans,
        ...!!filterAfterYourVoteAndBooleans ? [
            ...filterAfterYourVoteAndBooleans
        ] : [],
        ...AggregateLogic.representativeUsersForYourVote,
        ...AggregateLogic.representativeUsersForUserVote,
        ...AggregateLogic.representeeVotes,
        ...AggregateLogic.mergedChoices,
        ...AggregateLogic.mergedChoicesUniqueRepresentatives,
        // ...AggregateLogic.mergedChoicesUniqueRepresentees, // broken
        ...!!filterAfterMerge ? [
            ...filterAfterMerge
        ] : [],
        ...AggregateLogic.matchChoiceParam(choiceFilters),
        ...AggregateLogic.questionAndGroup,
        ...AggregateLogic.mergeQuestionAndChoiceVotes,
        {
            '$addFields': {
                'userId': '$user'
            }
        },
        ...canViewUsersVoteOrCause({ AuthUser }),
        ...userHandle ? [
            {
                $match: {
                    'visibility.hasViewingPermission': true
                }
            }
        ] : [],
        ...AggregateLogic.sortLogic,
        ...AggregateLogic.addYourMemberRelationToGroup,
        ...AggregateLogic.userObject,

        ...(followsOnly && AuthUser) ? AggregateLogic.filterFollows : [],
    ];
};

export const representeesAndVoteAgg = ({
    efficientOrThorough,
    representativeId,
    isRepresentingYou, // false, for when removing vote
    groupId,
    groupHandle,
    questionText,
    choiceText
}) => [
        {
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
                            // saves even if direct,
                            // so that if representee changes to null
                            // we already have the representatives
                        }
                    }
                ]
            }
        },
        {
            $addFields: { Vote: { '$first': '$Vote' } },
        },
        ...(efficientOrThorough === 'thorough') ? [{
            $lookup: {
                as: 'representatives',
                from: 'UserRepresentations',
                let: {
                    representee: "$representeeId"
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
                        $match: {
                            $expr: { $gt: [{ $size: "$vote" }, 0] }
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                // '$first': '$vote',
                                representativeId: { '$first': '$vote.representativeId' },
                                position: { '$first': '$vote.position' },
                                forWeight: { '$first': '$vote.forWeight' },
                                againstWeight: { '$first': '$vote.againstWeight' },
                                lastEditOn: { '$first': '$vote.lastEditOn' },
                                createdOn: { '$first': '$vote.createdOn' }
                            }
                        }
                    }
                ],
            }
        }] : []
    ];

export const representativeVotesAgg = ({
    groupHandle,
    groupId,
    representativeId,
    representeeId,
    efficientOrThorough
}) => [
        {
            $match: {
                'groupChannel.group': groupHandle,
                // questionText: 'lt-1',
                $expr: {
                    $eq: [
                        "$user",
                        { "$toObjectId": representativeId }
                    ]
                }
            }
        },
        {
            $lookup: {
                as: 'RepresenteeVote',
                from: 'Votes',
                let: {
                    questionText: "$questionText",
                    choiceText: "$choiceText",
                    group: "$groupChannel.group"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$questionText", "$$questionText"] },
                                    { $eq: ["$choiceText", "$$choiceText"] },
                                    { $eq: ["$groupChannel.group", "$$group"] },
                                    { $eq: ["$user", { "$toObjectId": representeeId }] }
                                ]
                            }
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                RepresenteeVote: {
                    '$first': '$RepresenteeVote',
                }

            }
        },
        ...(efficientOrThorough === 'thorough') ? [{
            $lookup: {
                as: 'RepresenteeRepresentativesVotes',
                from: 'UserRepresentations',
                let: {
                    questionText: "$questionText",
                    choiceText: "$choiceText",
                    group: "$groupChannel.group"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$representeeId",
                                    { "$toObjectId": representeeId }
                                ]
                            },
                            groupId: ObjectId(groupId),
                            isRepresentingYou: true // HUM!
                        }
                    },
                    {
                        $lookup: {
                            as: 'vote',
                            from: 'Votes',
                            let: {
                                representativeId: "$representativeId",
                                questionText: "$$questionText",
                                choiceText: "$$choiceText",
                                group: "$$group"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$questionText", "$$questionText"] },
                                                { $eq: ["$choiceText", "$$choiceText"] },
                                                { $eq: ["$groupChannel.group", "$$group"] },
                                                { $eq: ["$user", { "$toObjectId": "$$representativeId" }] }
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
                        $match: {
                            $expr: { $gt: [{ $size: "$vote" }, 0] }
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                // '$first': '$vote',
                                representativeId: { '$first': '$vote.representativeId' },
                                position: { '$first': '$vote.position' },
                                forWeight: { '$first': '$vote.forWeight' },
                                againstWeight: { '$first': '$vote.againstWeight' },
                                lastEditOn: { '$first': '$vote.lastEditOn' },
                                createdOn: { '$first': '$vote.createdOn' }
                            }
                        }
                    }
                ],
            }
        }] : []
    ];