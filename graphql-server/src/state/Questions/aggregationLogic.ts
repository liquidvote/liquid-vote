export const QuestionsAgg = ({
    questionText,
    group,
    AuthUserId
}) => [
        {
            '$match': {
                ...questionText && { 'questionText': questionText },
                'groupChannel.group': group
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
                'preserveNullAndEmptyArrays': true
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
                }
            }
        }, {
            '$addFields': {
                'yourVote.representatives': '$yourVote_Representatives'
            }
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
    ]