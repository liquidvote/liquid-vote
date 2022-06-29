import { ObjectId } from 'mongodb';

import { votesInCommonPipelineForVotes } from '../Users/aggregationLogic/votesInCommonPipelineForVotes';

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
            
            // {
            //     '$unwind': {
            //         'path': '$yourVote.representatives',
            //         'preserveNullAndEmptyArrays': true
            //     }
            // }, {
            //     '$lookup': {
            //         'as': 'representativeUser',
            //         'from': 'Users',
            //         'localField': 'yourVote.representatives.representativeId',
            //         'foreignField': '_id',
            //     }
            // }, {
            //     '$addFields': {
            //         'representativeUser': {
            //             '$first': '$representativeUser.LiquidUser'
            //         }
            //     }
            // }, {
            //     '$addFields': {
            //         'yourVote.representatives.representativeHandle': '$representativeUser.handle',
            //         'yourVote.representatives.representativeName': '$representativeUser.name',
            //         'yourVote.representatives.representativeAvatar': '$representativeUser.avatar'
            //     }
            // }, {
            //     '$group': {
            //         '_id': {
            //             'user': '$user',
            //             'questionText': '$questionText',
            //             'choiceText': '$choiceText',
            //             'groupChannel': '$groupChannel'
            //         },
            //         'questionText': { '$first': '$questionText' },
            //         'choiceText': { '$first': '$choiceText' },
            //         'groupChannel': { '$first': '$groupChannel' },
            //         'lastEditOn': { '$first': '$lastEditOn' },
            //         'userVote': { '$first': '$userVote' },
            //         'yourVote': { '$first': '$yourVote' },
            //         'youAndUserDetails': { '$first': '$youAndUserDetails' },
            //         'yourVote_representatives': { '$push': '$yourVote.representatives' },
            //         'user': { '$first': '$user' },
            //     }
            // }, {
            //     '$addFields': {
            //         'yourVote.representatives': {
            //             '$filter': {
            //                 'input': '$yourVote_representatives',
            //                 'as': 'r',
            //                 'cond': {
            //                     "$gt": ["$$r", {}]
            //                 }
            //             }
            //         }
            //     }
            // }, {
            //     '$addFields': {
            //         'yourVote.representatives': '$representatives'
            //     }
            // },
            
            
            {
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
    // ⚠️ WIP
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
                        'representativeId': '$representatives.representativeId'
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
});

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