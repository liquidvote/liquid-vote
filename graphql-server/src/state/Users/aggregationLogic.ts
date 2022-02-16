import { ObjectId } from 'mongodb';

export const votesInCommonPipelineForVotes = ({
    groupHandle,
    authUserId
}) => [
        {
            '$match': {
                '$and': [
                    {
                        '$expr': {
                            '$eq': [
                                '$user', new ObjectId(authUserId)
                            ]
                        }
                    },
                    ...!!groupHandle ? [{
                        '$expr': {
                            '$eq': [
                                '$groupChannel.group', groupHandle
                            ]
                        }
                    }] : [],
                ],
            }
        },
        {
            '$lookup': {
                'as': 'userVote',
                'from': 'Votes',
                'let': {
                    'userId': '$$userId',
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
                                }
                            ]
                        }
                    }
                ]
            }
        }, {
            '$match': {
                'userVote': {
                    '$gte': {
                        '$size': 1
                    }
                }
            }
        }, {
            '$addFields': {
                'userVote': {
                    '$first': '$userVote'
                }
            }
        }, {
            '$project': {
                'bothDirect': {
                    '$and': [
                        {
                            '$eq': [
                                '$isDirect', true
                            ]
                        }, {
                            '$eq': [
                                '$userVote.isDirect', true
                            ]
                        }
                    ]
                },
                'InAgreement': {
                    '$and': [
                        {
                            '$eq': [
                                '$position', '$userVote.position'
                            ]
                        }
                    ]
                },
                'userVoteMadeByYou': {
                    '$and': [
                        {

                            '$eq': [
                                '$userVote.isDirect', false
                            ]
                        },
                        {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$userVote.representatives',
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
                        }
                    ]
                },
                'userVoteMadeForYou': {
                    '$and': [
                        {

                            '$eq': [
                                '$isDirect', false
                            ]
                        },
                        {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$representatives',
                                            'as': 'r',
                                            'cond': {
                                                '$eq': [
                                                    '$$r.representativeId', '$userVote.user'
                                                ]
                                            }
                                        }
                                    }
                                }, 1
                            ]
                        }
                    ]
                }
            }
        }, {
            '$group': {
                '_id': null,
                'votesInCommon': {
                    '$sum': 1
                },
                'directVotesInCommon': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$bothDirect', true
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'directVotesInAgreement': {
                    '$sum': {
                        '$cond': [
                            {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$InAgreement', true
                                        ]
                                    }, {
                                        '$eq': [
                                            '$bothDirect', true
                                        ]
                                    }
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'directVotesInDisagreement': {
                    '$sum': {
                        '$cond': [
                            {
                                '$and': [
                                    {
                                        '$eq': [
                                            '$InAgreement', false
                                        ]
                                    }, {
                                        '$eq': [
                                            '$bothDirect', true
                                        ]
                                    }
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'indirectVotesMadeByYou': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$userVoteMadeByYou', true
                                ]
                            }, 1, 0
                        ]
                    }
                },
                'indirectVotesMadeForYou': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$userVoteMadeForYou', true
                                ]
                            }, 1, 0
                        ]
                    }
                }
            }
        }
    ];