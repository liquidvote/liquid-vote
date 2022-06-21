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