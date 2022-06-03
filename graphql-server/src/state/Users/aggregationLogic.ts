import { ObjectId } from 'mongodb';

export const votesInCommonPipelineForVotes = () => [
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

// statsAndYourStats
//
//  Aggregation to get the data needed for the comparison circles
//
// Outputs:
// yourStats {
//     directVotesInCommon
//     directVotesInAgreement
//     directVotesInDisagreement
//     indirectVotesMadeByYou
//     indirectVotesMadeForYou
// }
// stats {
//     directVotesMade
// }
//
// Params:
// $_id - UserId
// $groupHandle
// $authUserId
export const statsAndYourStats = () => [
    {
        '$lookup': {
            'as': 'yourStats',
            'from': 'Votes',
            'let': {
                'userId': "$_id",
                'groupHandle': '$groupHandle',
                'authUserId': '$authUserId'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', "'$$authUserId'"
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$groupHandle'
                                    ]
                                }
                            }
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
    }, {
        '$lookup': {
            'as': 'directVotesMadeByUser',
            'from': 'Votes',
            'let': {
                'userId': "$_id",
                'groupHandle': '$$groupHandle'
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
                                        '$groupChannel.group', '$$groupHandle'
                                    ]
                                }
                            },
                        ],
                    }
                },
            ]
        }
    }, {
        '$addFields': {
            'stats': {
                'directVotesMade': {
                    $size: '$directVotesMadeByUser'
                }
            }
        }
    }, {
        $sort: { 'yourStats.directVotesInCommon': -1 }
    }
];
