import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from '../../Users/aggregationLogic/votesInCommonPipelineForVotes';

export const QuestionsAgg = ({
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

        ...getYourStatsForRepresentatives_On_QuestionsAgg({ AuthUserId }),

        ...getYourStatsForAgainstMostRepresentingVoters_On_QuestionsAgg({ AuthUserId }),

        ...getYourStatsForAgainstMostRepresentingVoters_On_QuestionsChoicesAgg({ AuthUserId }),

        ...getYourStatsForFortMostRepresentingVoters_On_QuestionsAgg({ AuthUserId }),
        
        ...getYourStatsForForMostRepresentingVoters_On_QuestionsChoicesAgg({ AuthUserId }),

        ...votersYouFollow({ AuthUserId }),

        {
            '$group': {
                '_id': {
                    'questionText': '$questionText'
                },
                'choices': {
                    '$push': {
                        'choice': '$choices',
                        'yourVote': '$yourVote',
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
                'yourStats': {
                    '$first': '$yourStats'
                },
                'createdBy': {
                    '$first': '$createdBy'
                },
                'votersInCommonStats': {
                    '$first': '$votersInCommonStats'
                },
                'group': {
                    '$first': '$group'
                }
            }
        },
    ];

const getYourStatsForRepresentatives_On_QuestionsAgg = ({ AuthUserId }) => [
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
            'yourVote.representatives.representativeHandle': '$representativeUser.handle',
            'yourVote.representatives.representativeName': '$representativeUser.name',
            'yourVote.representatives.representativeAvatar': '$representativeUser.avatar'
        }
    },
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                'as': 'directVotesMade_byRepresentative',
                'from': 'Votes',
                'let': {
                    'userId': '$yourVote.representatives.representativeId',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', '$$userId'
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isDirect', true
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$ne': [
                                            '$position', null
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
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$addFields': {
                'yourVote.representatives.stats': {
                    'directVotesMade': {
                        $size: '$directVotesMade_byRepresentative'
                    }
                }
            }
        },
        {
            '$lookup': {
                'as': 'yourStats_forRepresentative',
                'from': 'Votes',
                'let': {
                    'userId': '$yourVote.representatives.representativeId',
                    'group': "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', new ObjectId(AuthUserId)
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
                            ],
                        }
                    },
                    ...votesInCommonPipelineForVotes()
                ]
            }
        }, {
            '$addFields': {
                'yourVote.representatives.yourStats': { '$first': '$yourStats_forRepresentative' }
            }
        }
    ] : [],
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
            'votersInCommonStats': {
                '$first': '$votersInCommonStats'
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

const getYourStatsForAgainstMostRepresentingVoters_On_QuestionsAgg = ({ AuthUserId }) => [
    {
        '$unwind': {
            'path': '$stats.againstMostRepresentingVoters',
            'preserveNullAndEmptyArrays': true
        }
    }, {
        '$lookup': {
            'as': 'againstMostRepresentingVoter',
            'from': 'Users',
            'localField': 'stats.againstMostRepresentingVoters.handle',
            'foreignField': 'LiquidUser.handle'
        }
    }, {
        '$addFields': {
            "againstMostRepresentingVoter": {
                "$mergeObjects": [{
                    _id: { "$first": "$againstMostRepresentingVoter._id" }
                }, {
                    "$first": "$againstMostRepresentingVoter.LiquidUser"
                }]
            }
        }
    },
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                'as': 'directVotesMade_byAgainstMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$againstMostRepresentingVoter._id',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', '$$userId'
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isDirect', true
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$ne': [
                                            '$position', null
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
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$addFields': {
                'againstMostRepresentingVoter.stats': {
                    'directVotesMade': {
                        $size: '$directVotesMade_byAgainstMostRepresentingVoter'
                    }
                }
            }
        },
        {
            '$lookup': {
                'as': 'yourStats_forAgainstMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$againstMostRepresentingVoter._id',
                    'group': "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', new ObjectId(AuthUserId)
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
                            ],
                        }
                    },
                    ...votesInCommonPipelineForVotes()
                ]
            }
        }, {
            '$addFields': {
                'againstMostRepresentingVoter.yourStats': { '$first': '$yourStats_forAgainstMostRepresentingVoter' }
            }
        }
    ] : [],
    {
        '$group': {
            '_id': {
                'questionText': '$questionText',
                'choiceText': '$choiceText'
            },
            'againstMostRepresentingVoters': {
                '$push': '$againstMostRepresentingVoter'
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
            'votersInCommonStats': {
                '$first': '$votersInCommonStats'
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
            "stats.againstMostRepresentingVoters": {
                "$cond": {
                    "if": {
                        $ne: ["$stats.againstMostRepresentingVoters", null]
                    },
                    "then": "$againstMostRepresentingVoters",
                    "else": "$$REMOVE"
                }
            },
        }
    }, {
        '$sort': { 'i': 1 }
    },
];

const getYourStatsForAgainstMostRepresentingVoters_On_QuestionsChoicesAgg = ({ AuthUserId }) => [
    {
        '$unwind': {
            'path': '$choices.stats.againstMostRepresentingVoters',
            'preserveNullAndEmptyArrays': true
        }
    }, {
        '$lookup': {
            'as': 'againstMostRepresentingVoter',
            'from': 'Users',
            'localField': 'choices.stats.againstMostRepresentingVoters.handle',
            'foreignField': 'LiquidUser.handle'
        }
    }, {
        '$addFields': {
            "againstMostRepresentingVoter": {
                "$mergeObjects": [{
                    _id: { "$first": "$againstMostRepresentingVoter._id" }
                }, {
                    "$first": "$againstMostRepresentingVoter.LiquidUser"
                }]
            }
        }
    },
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                'as': 'directVotesMade_byAgainstMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$againstMostRepresentingVoter._id',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', '$$userId'
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isDirect', true
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$ne': [
                                            '$position', null
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
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$addFields': {
                'againstMostRepresentingVoter.stats': {
                    'directVotesMade': {
                        $size: '$directVotesMade_byAgainstMostRepresentingVoter'
                    }
                }
            }
        },
        {
            '$lookup': {
                'as': 'yourStats_forAgainstMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$againstMostRepresentingVoter._id',
                    'group': "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', new ObjectId(AuthUserId)
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
                            ],
                        }
                    },
                    ...votesInCommonPipelineForVotes()
                ]
            }
        }, {
            '$addFields': {
                'againstMostRepresentingVoter.yourStats': { '$first': '$yourStats_forAgainstMostRepresentingVoter' }
            }
        }
    ] : [],
    {
        '$group': {
            '_id': {
                'questionText': '$questionText',
                'choiceText': '$choiceText'
            },
            'againstMostRepresentingVoters': {
                '$push': '$againstMostRepresentingVoter'
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
            'votersInCommonStats': {
                '$first': '$votersInCommonStats'
            },
            'group': {
                '$first': '$group'
            },
            "choiceText": {
                "$first": "$choiceText"
            }
        }
    },
    {
        '$addFields': {
            "choices.stats.againstMostRepresentingVoters": {
                "$cond": {
                    "if": {
                        $ne: ["$choices.stats.againstMostRepresentingVoters", null]
                    },
                    "then": "$againstMostRepresentingVoters",
                    "else": "$$REMOVE"
                }
            },
        }
    },
    {
        '$sort': { 'i': 1 }
    },
];

const getYourStatsForFortMostRepresentingVoters_On_QuestionsAgg = ({ AuthUserId }) => [
    {
        '$unwind': {
            'path': '$stats.forMostRepresentingVoters',
            'preserveNullAndEmptyArrays': true
        }
    }, {
        '$lookup': {
            'as': 'forMostRepresentingVoter',
            'from': 'Users',
            'localField': 'stats.forMostRepresentingVoters.handle',
            'foreignField': 'LiquidUser.handle'
        }
    }, {
        '$addFields': {
            "forMostRepresentingVoter": {
                "$mergeObjects": [{
                    _id: { "$first": "$forMostRepresentingVoter._id" }
                }, {
                    "$first": "$forMostRepresentingVoter.LiquidUser"
                }]
            }
        }
    },
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                'as': 'directVotesMade_byForMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$forMostRepresentingVoter._id',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', '$$userId'
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isDirect', true
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$ne': [
                                            '$position', null
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
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$addFields': {
                'forMostRepresentingVoter.stats': {
                    'directVotesMade': {
                        $size: '$directVotesMade_byForMostRepresentingVoter'
                    }
                }
            }
        },
        {
            '$lookup': {
                'as': 'yourStats_forForMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$forMostRepresentingVoter._id',
                    'group': "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', new ObjectId(AuthUserId)
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
                            ],
                        }
                    },
                    ...votesInCommonPipelineForVotes()
                ]
            }
        }, {
            '$addFields': {
                'forMostRepresentingVoter.yourStats': { '$first': '$yourStats_forForMostRepresentingVoter' }
            }
        }
    ] : [],
    {
        '$group': {
            '_id': {
                'questionText': '$questionText',
                'choiceText': '$choiceText'
            },
            'forMostRepresentingVoters': {
                '$push': '$forMostRepresentingVoter'
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
            'votersInCommonStats': {
                '$first': '$votersInCommonStats'
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
            "stats.forMostRepresentingVoters": {
                "$cond": {
                    "if": {
                        $ne: ["$stats.forMostRepresentingVoters", null]
                    },
                    "then": "$forMostRepresentingVoters",
                    "else": "$$REMOVE"
                }
            },
        }
    }, {
        '$sort': { 'i': 1 }
    },
];

const getYourStatsForForMostRepresentingVoters_On_QuestionsChoicesAgg = ({ AuthUserId }) => [
    {
        '$unwind': {
            'path': '$choices.stats.forMostRepresentingVoters',
            'preserveNullAndEmptyArrays': true
        }
    }, {
        '$lookup': {
            'as': 'forMostRepresentingVoter',
            'from': 'Users',
            'localField': 'choices.stats.forMostRepresentingVoters.handle',
            'foreignField': 'LiquidUser.handle'
        }
    }, {
        '$addFields': {
            "forMostRepresentingVoter": {
                "$mergeObjects": [{
                    _id: { "$first": "$forMostRepresentingVoter._id" }
                }, {
                    "$first": "$forMostRepresentingVoter.LiquidUser"
                }]
            }
        }
    },
    ...(!!AuthUserId) ? [
        {
            '$lookup': {
                'as': 'directVotesMade_byForMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$forMostRepresentingVoter._id',
                    'group': '$groupChannel.group'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', '$$userId'
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$isDirect', true
                                        ]
                                    }
                                },
                                {
                                    '$expr': {
                                        '$ne': [
                                            '$position', null
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
                            ],
                        }
                    },
                ]
            }
        },
        {
            '$addFields': {
                'forMostRepresentingVoter.stats': {
                    'directVotesMade': {
                        $size: '$directVotesMade_byForMostRepresentingVoter'
                    }
                }
            }
        },
        {
            '$lookup': {
                'as': 'yourStats_forForMostRepresentingVoter',
                'from': 'Votes',
                'let': {
                    'userId': '$forMostRepresentingVoter._id',
                    'group': "$groupChannel.group"
                },
                'pipeline': [
                    {
                        '$match': {
                            '$and': [
                                {
                                    '$expr': {
                                        '$eq': [
                                            '$user', new ObjectId(AuthUserId)
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
                            ],
                        }
                    },
                    ...votesInCommonPipelineForVotes()
                ]
            }
        }, {
            '$addFields': {
                'forMostRepresentingVoter.yourStats': { '$first': '$yourStats_forForMostRepresentingVoter' }
            }
        }
    ] : [],
    {
        '$group': {
            '_id': {
                'questionText': '$questionText',
                'choiceText': '$choiceText'
            },
            'forMostRepresentingVoters': {
                '$push': '$forMostRepresentingVoter'
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
            'votersInCommonStats': {
                '$first': '$votersInCommonStats'
            },
            'group': {
                '$first': '$group'
            },
            "choiceText": {
                "$first": "$choiceText"
            }
        }
    },
    {
        '$addFields': {
            "choices.stats.forMostRepresentingVoters": {
                "$cond": {
                    "if": {
                        $ne: ["$choices.stats.forMostRepresentingVoters", null]
                    },
                    "then": "$forMostRepresentingVoters",
                    "else": "$$REMOVE"
                }
            },
        }
    },
    {
        '$sort': { 'i': 1 }
    },
];

const votersYouFollow = ({ AuthUserId }) => [
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
                    },
                    {
                        '$lookup': {
                            'as': 'directVotesMade',
                            'from': 'Votes',
                            'let': {
                                'userId': '$_id',
                                'group': '$$group'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$and': [
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$user', '$$userId'
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$isDirect', true
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$ne': [
                                                        '$position', null
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
                                        ],
                                    }
                                },
                            ]
                        }
                    },
                    {
                        '$addFields': {
                            'stats': {
                                'directVotesMade': {
                                    $size: '$directVotesMade'
                                }
                            }
                        }
                    },
                    {
                        '$lookup': {
                            'as': 'yourStats',
                            'from': 'Votes',
                            'let': {
                                'userId': '$_id',
                                'group': "$$group"
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$and': [
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$user', new ObjectId(AuthUserId)
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
                                        ],
                                    }
                                },
                                ...votesInCommonPipelineForVotes()
                            ]
                        }
                    }, {
                        '$addFields': {
                            'yourStats': { '$first': '$yourStats' }
                        }
                    }
                ]
            }
        },
        {
            '$addFields': {
                'yourStats': { 'votersYouFollow': '$votersYouFollow' }
            }
        },
    ] : []
];