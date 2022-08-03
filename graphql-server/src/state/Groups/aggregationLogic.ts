import { ObjectId } from 'mongodb';

export const groupStats = () => [
    {
        '$lookup': {
            as: "groupStats_members",
            from: "GroupMembers",
            let: {
                'groupId': '$group._id',
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isMember', true
                                ]
                            }, {
                                '$eq': [
                                    '$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },
    {
        '$lookup': {
            as: "groupStats_questions",
            from: "Questions",
            let: {
                'groupHandle': '$group.handle',
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$ne': [
                                    '$status', 'deleted'
                                ]
                            }, {
                                '$eq': [
                                    '$groupChannel.group', '$$groupHandle'
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },
    {
        '$lookup': {
            as: "groupStats_representations",
            from: "UserRepresentations",
            let: {
                'groupId': '$group._id',
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isRepresentingYou', true
                                ]
                            }, {
                                '$eq': [
                                    '$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },
    {
        '$lookup': {
            as: "groupStats_directVotesMade",
            from: "Votes",
            let: {
                'groupHandle': '$group.handle',
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isDirect', true
                                ]
                            }, {
                                '$ne': [
                                    '$position', null
                                ]
                            }, {
                                '$eq': [
                                    '$groupChannel.group', '$$groupHandle'
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },
    {
        '$lookup': {
            as: "groupStats_indirectVotesMade",
            from: "Votes",
            let: {
                'groupHandle': '$group.handle',
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isDirect', false
                                ]
                            }, {
                                '$eq': [
                                    '$groupChannel.group', '$$groupHandle'
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },

    {
        '$addFields': {
            'groupStats': {
                'members': {
                    $size: '$groupStats_members'
                },
                'questions': {
                    $size: '$groupStats_questions'
                },
                'representations': {
                    $size: '$groupStats_representations'
                },
                'directVotesMade': {
                    $size: '$groupStats_directVotesMade'
                },
                'indirectVotesMade': {
                    $size: '$groupStats_indirectVotesMade'
                }
            },
        }
    },
]

export const yourGroupStats = (AuthUser) => [
    {
        '$lookup': {
            as: "yourGroupStats_membersYouFollow",
            from: "UserFollows",
            let: {
                'loggedInUser': new ObjectId(AuthUser._id),
                'groupId': '$group._id',
                'groupHandle': '$group.handle'
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$eq': [
                            '$followingId', '$$loggedInUser'
                        ]
                    }
                }
            }, {
                "$lookup": {
                    "as": "isGroupMember",
                    "from": "GroupMembers",
                    let: {
                        'followedId': '$followedId',
                        'groupId': '$$groupId'
                    },
                    "pipeline": [
                        {
                            "$match": {
                                '$and': [
                                    { "$expr": { "$eq": ["$userId", "$$followedId"] } },
                                    { "$expr": { "$eq": ["$groupId", "$$groupId"] } },
                                    { "$expr": { "$eq": ["$isMember", true] } }
                                ]
                            }
                        }
                    ],
                }
            },
            {
                '$match': {
                    '$expr': {
                        '$eq': [
                            { "$size": "$isGroupMember" }, 1
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
            }]
        },
    },

    {
        '$lookup': {
            as: "yourGroupStats_representing",
            from: "UserRepresentations",
            let: {
                'groupId': '$group._id',
                'loggedInUser': new ObjectId(AuthUser._id),
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isRepresentingYou', true
                                ]
                            }, {
                                '$eq': [
                                    '$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }
                                ]
                            }, {
                                '$eq': [
                                    '$representeeId', {
                                        '$toObjectId': '$$loggedInUser'
                                    }
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },

    {
        '$lookup': {
            as: "yourGroupStats_representedBy",
            from: "UserRepresentations",
            let: {
                'groupId': '$group._id',
                'loggedInUser': new ObjectId(AuthUser._id),
            },
            'pipeline': [{
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$eq': [
                                    '$isRepresentingYou', true
                                ]
                            }, {
                                '$eq': [
                                    '$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }
                                ]
                            }, {
                                '$eq': [
                                    '$representativeId', {
                                        '$toObjectId': '$$loggedInUser'
                                    }
                                ]
                            }
                        ]
                    }
                }
            }]
        }
    },

    {
        '$addFields': {
            'yourGroupStats': {
                'membersYouFollow': '$yourGroupStats_membersYouFollow',
                'membersYouFollowCount': { $size: '$yourGroupStats_membersYouFollow' },
                'representing': { $size: '$yourGroupStats_representing' },
                'representedBy': { $size: '$yourGroupStats_representedBy' },
            },
        }
    },
]

export const userGroupStats = ({ userId }) => [
    {
        '$lookup': {
            'as': 'userGroupStats_directVotesMadeByUser',
            'from': 'Votes',
            'let': {
                'userId': new ObjectId(userId),
                'groupHandle': '$group.handle'
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

                {
                    '$addFields': {
                        "daysAgo": {
                            "$divide": [
                                {
                                    "$subtract": [
                                        Date.now(),
                                        "$lastEditOn"
                                    ]
                                },
                                86400000
                            ]
                        },
                        "inverseDaysAgo": {
                            "$divide": [
                                1,
                                {
                                    "$divide": [
                                        {
                                            "$subtract": [
                                                Date.now(),
                                                "$lastEditOn"
                                            ]
                                        },
                                        86400000
                                    ]
                                }
                            ]
                        }
                    }
                }

            ]
        }
    },
    {
        '$addFields': {
            'userGroupStats': {
                'directVotesMade': {
                    $size: '$userGroupStats_directVotesMadeByUser'
                },
                "inverseDaysAgoSum": {
                    $sum: "$userGroupStats_directVotesMadeByUser.inverseDaysAgo"
                }
            }
        }
    },
];