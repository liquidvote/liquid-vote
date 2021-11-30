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
                }
            }
        }, {
            '$addFields': {
                'question': '$$ROOT'
            }
        }, {
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
        }, {
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
        }, {
            '$addFields': {
                'yourVote_Representatives': '$yourVote.representatives'
            }
        }, {
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
                'yourVote': {
                    '$first': '$yourVote'
                },
                'id': {
                    '$first': '$_id'
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
                }
            }
        }, {
            '$addFields': {
                'yourVote.representatives': '$yourVote_Representatives'
            }
        }, {
            '$sort': { 'i': 1 }
        }, {
            '$group': {
                '_id': {
                    'questionText': '$questionText'
                },
                'choices': {
                    '$push': {
                        'choice': '$choices',
                        'yourVote': '$yourVote'
                    }
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
                'votersInCommonStats': {
                    '$first': '$votersInCommonStats'
                }
            }
        }, {
            $lookup: {
                from: 'Groups',
                localField: 'groupChannel.group',
                foreignField: 'handle',
                as: 'group'
            }
        }, {
            $addFields: { 'group': { $first: '$group' } }
        }
    ];

export const QuestionsInCommonAgg = ({ questionText, group }) => [
    {
        '$match': {
            'questionText': questionText,
            'groupChannel.group': group
        }
    }, {
        '$lookup': {
            'as': 'Voters',
            'from': 'Votes',
            'let': {
                'questionText': '$questionText',
                'group': '$groupChannel.group'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$questionText', '$$questionText'
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$group'
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    $group: {
                        _id: {
                            user: '$user'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $replaceRoot: { newRoot: { voter: "$_id.user" } }
                }
            ]
        }
    }, {
        '$unwind': {
            'path': '$Voters'
        }
    }, {
        '$replaceRoot': {
            'newRoot': {
                'voter': '$Voters.voter'
            }
        }
    }, {
        '$lookup': {
            'as': 'AllVoterVotes',
            'from': 'Votes',
            'let': {
                'voter': '$voter'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', {
                                            '$toObjectId': '$$voter'
                                        }
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$group': {
                        '_id': {
                            'questionText': '$questionText',
                            'group': '$groupChannel.group'
                        },
                        'count': {
                            '$sum': 1
                        }
                    }
                }
            ]
        }
    }, {
        '$unwind': {
            'path': '$AllVoterVotes'
        }
    }, {
        '$group': {
            '_id': {
                'questionText': '$AllVoterVotes._id.questionText',
                'group': '$AllVoterVotes._id.group'
            },
            'count': {
                '$sum': 1
            }
        }
    }, {
        '$sort': {
            'count': -1
        }
    }, {
        '$lookup': {
            'as': 'question',
            'from': 'Questions',
            'let': {
                'questionText': '$_id.questionText',
                'group': '$_id.group',
                'count': '$count'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$questionText', '$$questionText'
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$group'
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$addFields': {
                        'votersInCommonStats': {
                            'voterCount': '$$count'
                        }
                    }
                }
            ]
        }
    },
    {
        '$match': {
            'question.0': { $exists: true }
        }
    },
    {
        '$replaceRoot': {
            'newRoot': {
                '$first': '$question'
            }
        }
    }
];