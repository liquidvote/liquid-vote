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