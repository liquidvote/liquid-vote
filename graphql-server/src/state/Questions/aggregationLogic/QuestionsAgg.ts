import { ObjectId } from 'mongodb';

export const QuestionsAgg = ({
    userId,
    questionText,
    group,
    AuthUserId
}) => [
        {
            '$match': {
                ...questionText && { 'questionText': questionText },
                ...group && { 'groupChannel.group': group },
                'status': { '$ne': 'deleted' }
            }
        }, {
            '$lookup': {
                'from': 'Users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            }
        }, {
            '$addFields': {
                'createdBy': {
                    '$first': '$createdBy.LiquidUser'
                },
                'id': '$_id'
            }
        }, {
            '$addFields': {
                'question': '$$ROOT'
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
            $addFields: { 'group': { $first: '$group' } }
        },
        // TODO: confirm public group or user belongs to Link Only Group
        {
            '$unwind': {
                'path': '$choices',
                'preserveNullAndEmptyArrays': true,
                'includeArrayIndex': "i"
            }
        }, {
            '$addFields': {
                'choiceText': {
                    '$ifNull': [
                        '$choices.text', null
                    ]
                }
            }
        }, {
            '$lookup': {
                'as': 'yourVote',
                'from': 'Votes',
                'let': {
                    'user': AuthUserId,
                    'questionText': '$questionText',
                    'choiceText': '$choiceText',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$questionText', '$$questionText'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$choiceText', '$$choiceText'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$groupChannel.group', '$$group'
                                        ]
                                    }, {
                                        '$eq': [
                                            '$user', {
                                                '$toObjectId': '$$user'
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        }, {
            '$addFields': {
                'yourVote': {
                    '$first': '$yourVote'
                }
            }
        },

        ...userId ? [
            {
                '$lookup': {
                    'as': 'userVote',
                    'from': 'Votes',
                    'let': {
                        'user': userId,
                        'questionText': '$questionText',
                        'choiceText': '$choiceText',
                        'group': '$groupChannel.group'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$questionText', '$$questionText'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$choiceText', '$$choiceText'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$groupChannel.group', '$$group'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$user', {
                                                    '$toObjectId': '$$user'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }, {
                '$addFields': {
                    'userVote': {
                        '$first': '$userVote'
                    }
                }
            },
        ] : [],

        ...(!!AuthUserId) ? [
            ...getYourVoteRepresentativesUsers_On_QuestionsAgg({ AuthUserId }),

            ...yourStats({ AuthUserId }),
        ] : [],

        // Merge Choices into Question
        {
            '$group': {
                '_id': {
                    'questionText': '$questionText'
                },
                'choices': {
                    '$push': {
                        'choice': '$choices',
                        'yourVote': '$yourVote',
                        'userVote': '$userVote',
                        'yourStats': '$yourStats',
                    }
                },
                'allowNewChoices': {
                    '$first': '$allowNewChoices'
                },
                'id': {
                    '$first': '$id'
                },
                'questionType': {
                    '$first': '$questionType'
                },
                'questionText': {
                    '$first': '$questionText'
                },
                'description': {
                    '$first': '$description'
                },
                'startText': {
                    '$first': '$startText'
                },
                'groupChannel': {
                    '$first': '$groupChannel'
                },
                'resultsOn': {
                    '$first': '$resultsOn'
                },
                'lastEditOn': {
                    '$first': '$lastEditOn'
                },
                'createdOn': {
                    '$first': '$createdOn'
                },
                'stats': {
                    '$first': '$stats'
                },
                'yourVote_representatives': { '$push': '$yourVote.representatives' },
                'yourStats_votersYouFollow': { '$push': '$yourStats.votersYouFollow' },
                'createdBy': {
                    '$first': '$createdBy'
                },
                'group': {
                    '$first': '$group'
                }
            }
        },

        ...(!!AuthUserId) ? [
            ...mergedYourVoteUniqueRepresentatives,
            ...mergedYourStatsVotersYouFollow,


            {
                '$addFields': {
                    'yourStats': {
                        'votersYouFollow': '$yourStats_votersYouFollow',
                        'votersRepresentingYou': '$yourVote_representatives'
                    }
                }
            },

        ] : []
    ];

const getYourVoteRepresentativesUsers_On_QuestionsAgg = ({ AuthUserId }) => [
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
            'representativeUser': {
                '$first': '$representativeUser.LiquidUser'
            }
        }
    }, {
        '$addFields': {
            'yourVote.representatives.representativeHandle': '$representativeUser.handle',  // should be obsoleted
            'yourVote.representatives.representativeName': '$representativeUser.name',      // should be obsoleted
            'yourVote.representatives.representativeAvatar': '$representativeUser.avatar',  // should be obsoleted
            'yourVote.representatives.handle': '$representativeUser.handle',
            'yourVote.representatives.name': '$representativeUser.name',
            'yourVote.representatives.avatar': '$representativeUser.avatar',
            'yourVote.representatives.vote.position': '$yourVote.representatives.position',
        }
    },
    {
        '$addFields': {
            'yourVote_Representatives': '$yourVote.representatives'
        }
    },
    {
        '$group': {
            '_id': {
                'questionText': '$questionText',
                'choiceText': '$choiceText'
            },
            'yourVote_Representatives': {
                '$push': '$yourVote_Representatives'
            },
            'choices': {
                '$first': '$choices'
            },
            'allowNewChoices': {
                '$first': '$allowNewChoices'
            },
            'yourVote': {
                '$first': '$yourVote'
            },
            'userVote': {
                '$first': '$userVote',
            },
            'id': {
                '$first': '$id'
            },
            'questionType': {
                '$first': '$questionType'
            },
            'questionText': {
                '$first': '$questionText'
            },
            'description': {
                '$first': '$description'
            },
            'startText': {
                '$first': '$startText'
            },
            'groupChannel': {
                '$first': '$groupChannel'
            },
            'resultsOn': {
                '$first': '$resultsOn'
            },
            'lastEditOn': {
                '$first': '$lastEditOn'
            },
            'createdOn': {
                '$first': '$createdOn'
            },
            'stats': {
                '$first': '$stats'
            },
            'createdBy': {
                '$first': '$createdBy'
            },
            'i': {
                '$first': '$i'
            },
            'group': {
                '$first': '$group'
            },
            "choiceText": {
                "$first": "$choiceText"
            }
        }
    }, {
        '$addFields': {
            'yourVote.representatives': '$yourVote_Representatives'
        }
    }, {
        '$sort': { 'i': 1 }
    },
];

const mergedYourVoteUniqueRepresentatives = [
    {
        '$unwind': {
            'path': '$yourVote_representatives',
            'preserveNullAndEmptyArrays': true,
            "includeArrayIndex": "i1"
        }
    }, {
        '$unwind': {
            'path': '$yourVote_representatives',
            'preserveNullAndEmptyArrays': true,
            "includeArrayIndex": "i2"
        }
    }, {
        '$group': {
            '_id': {
                // no `choiceText`
                // 'user': '$_id.user',
                'questionText': '$questionText',
                'groupId': '$group._id',
                'representativeId': '$yourVote_representatives.representativeId'
            },
            'root': {
                '$first': '$$ROOT'
            }
        }
    },
    {
        '$group': {
            '_id': {
                'questionText': '$root.questionText'
            },
            'choices': {
                '$first': '$root.choices'
            },
            'allowNewChoices': {
                '$first': '$root.allowNewChoices'
            },
            'id': {
                '$first': '$root.id'
            },
            'questionType': {
                '$first': '$root.questionType'
            },
            'questionText': {
                '$first': '$root.questionText'
            },
            'description': {
                '$first': '$root.description'
            },
            'startText': {
                '$first': '$root.startText'
            },
            'groupChannel': {
                '$first': '$root.groupChannel'
            },
            'resultsOn': {
                '$first': '$root.resultsOn'
            },
            'lastEditOn': {
                '$first': '$root.lastEditOn'
            },
            'createdOn': {
                '$first': '$root.createdOn'
            },
            'stats': {
                '$first': '$root.stats'
            },
            'yourVote_representatives': { '$push': '$root.yourVote_representatives' },
            'yourStats_votersYouFollow': { '$first': '$root.yourStats_votersYouFollow' },
            'createdBy': {
                '$first': '$root.createdBy'
            },
            'group': {
                '$first': '$root.group'
            }
        }
    }
];

const mergedYourStatsVotersYouFollow = [
    {
        '$unwind': {
            'path': '$yourStats_votersYouFollow',
            'preserveNullAndEmptyArrays': true,
            "includeArrayIndex": "i1"
        }
    }, {
        '$unwind': {
            'path': '$yourStats_votersYouFollow',
            'preserveNullAndEmptyArrays': true,
            "includeArrayIndex": "i2"
        }
    }, {
        '$group': {
            '_id': {
                // no `choiceText`
                // 'user': '$_id.user',
                'questionText': '$questionText',
                'groupId': '$group._id',
                'yourStats_votersYouFollow_handle': '$yourStats_votersYouFollow.handle'
            },
            'root': {
                '$first': '$$ROOT'
            }
        }
    },
    {
        '$group': {
            '_id': {
                'questionText': '$root.questionText'
            },
            'choices': {
                '$first': '$root.choices'
            },
            'allowNewChoices': {
                '$first': '$root.allowNewChoices'
            },
            'id': {
                '$first': '$root.id'
            },
            'questionType': {
                '$first': '$root.questionType'
            },
            'questionText': {
                '$first': '$root.questionText'
            },
            'description': {
                '$first': '$root.description'
            },
            'startText': {
                '$first': '$root.startText'
            },
            'groupChannel': {
                '$first': '$root.groupChannel'
            },
            'resultsOn': {
                '$first': '$root.resultsOn'
            },
            'lastEditOn': {
                '$first': '$root.lastEditOn'
            },
            'createdOn': {
                '$first': '$root.createdOn'
            },
            'stats': {
                '$first': '$root.stats'
            },
            'yourVote_representatives': { '$first': '$root.yourVote_representatives' },
            'yourStats_votersYouFollow': { '$push': '$root.yourStats_votersYouFollow' },
            'createdBy': {
                '$first': '$root.createdBy'
            },
            'group': {
                '$first': '$root.group'
            }
        }
    }
];

const yourStats = ({ AuthUserId }) => [
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                as: "votersYouFollow",
                from: "UserFollows",
                let: {
                    'loggedInUser': AuthUserId,
                    "questionText": "$questionText",
                    "choiceText": "$choiceText",
                    "group": "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$followingId', {
                                        '$toObjectId': '$$loggedInUser'
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "$lookup": {
                            "as": "user",
                            "from": "Users",
                            let: {
                                'followedId': '$followedId',
                            },
                            "pipeline": [
                                {
                                    "$match": {
                                        '$and': [
                                            { "$expr": { "$eq": ["$_id", "$$followedId"] } }
                                        ]
                                    }
                                }
                            ],
                        }
                    }, {
                        "$replaceRoot": { newRoot: { "$first": "$user" } }
                    }, {
                        '$replaceRoot': {
                            newRoot: {
                                $mergeObjects: [
                                    { _id: "$_id" },
                                    "$LiquidUser"
                                ]
                            }
                        }
                    },
                    {
                        "$lookup": {
                            "as": "vote",
                            "from": "Votes",
                            'let': {
                                'questionText': '$$questionText',
                                'choiceText': '$$choiceText',
                                'group': '$$group',
                                'voterId': '$_id'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$expr': {
                                            '$and': [
                                                {
                                                    '$eq': [
                                                        '$questionText', '$$questionText'
                                                    ]
                                                }, {
                                                    '$eq': [
                                                        '$choiceText', '$$choiceText'
                                                    ]
                                                }, {
                                                    '$eq': [
                                                        '$groupChannel.group', '$$group'
                                                    ]
                                                }, {
                                                    "$eq": ["$user", {
                                                        "$toObjectId": "$$voterId"
                                                    }]
                                                }, {
                                                    "$ne": ['$position', 'delegated']
                                                }, {
                                                    "$ne": ['$position', null]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    { "$size": "$vote" }, 1
                                ]
                            }
                        }
                    },
                    {
                        '$addFields': {
                            'vote': { '$first': '$vote' }
                        }
                    }
                ]
            }
        },
        {
            '$addFields': {
                'yourStats': {
                    'votersYouFollow': '$votersYouFollow',
                    'votersRepresentingYou': '$yourVote.representatives'
                }
            }
        },
    ] : []
];