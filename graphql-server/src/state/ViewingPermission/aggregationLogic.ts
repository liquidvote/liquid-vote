import { ObjectId } from 'mongodb';

// groupId AuthUserId UserId
export const canViewUsersVoteOrCause = ({ AuthUser }) => [

    // get group - put this above 
    // {
    //     '$lookup': {
    //         'as': 'group',
    //         'from': 'Groups',
    //         'let': {
    //             'groupId': ['$userRel.groupId'] - CHANGE ME,
    //         },
    //         'pipeline': [
    //             {
    //                 '$match': {
    //                     '$and': [
    //                         {
    //                             '$expr': {
    //                                 '$eq': ['$_id', {
    //                                     '$toObjectId': '$$groupId'
    //                                 }]
    //                             }
    //                         },
    //                     ]
    //                 }
    //             }
    //         ],
    //     }
    // },
    // {
    //     '$addFields': {
    //         group: { '$first': '$group' }
    //     }
    // },

    // get userId - put this above 
    // {
    //     '$addFields': {
    //         userId: '$userId'
    //     }
    // },

    // userRel
    {
        '$lookup': {
            'as': 'userRel',
            'from': 'GroupMembers',
            'let': {
                'groupId': '$group._id',
                'userId': '$userId'
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': ['$userId', {
                                        '$toObjectId': '$$userId'
                                    }]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': ['$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }]
                                }
                            },
                            { '$expr': { '$eq': ['$isMember', true] } }
                        ]
                    }
                }
            ],
        }
    },
    {
        '$addFields': {
            userRel: { '$first': '$userRel' }
        }
    },
    // get your member rel
    {
        '$lookup': {
            'as': 'yourRel',
            'from': 'GroupMembers',
            'let': {
                'groupId': '$group._id',
                'yourId': new ObjectId(AuthUser._id)
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': ['$userId', {
                                        '$toObjectId': '$$yourId'
                                    }]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': ['$groupId', {
                                        '$toObjectId': '$$groupId'
                                    }]
                                }
                            },
                            { '$expr': { '$eq': ['$isMember', true] } }
                        ]
                    }
                }
            ],
        }
    },
    {
        '$addFields': {
            yourRel: { '$first': '$yourRel' }
        }
    },

    // get user following you rel
    {
        '$lookup': {
            'as': 'userFollowingYouRel',
            'from': 'UserFollows',
            'let': {
                'userId': '$userRel.userId',
                'yourId': new ObjectId(AuthUser._id)
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': ['$followedId', {
                                        '$toObjectId': '$$yourId'
                                    }]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': ['$followingId', {
                                        '$toObjectId': '$$userId'
                                    }]
                                }
                            },
                            { '$expr': { '$eq': ['$isFollowing', true] } }
                        ]
                    }
                }
            ],
        }
    },
    {
        '$addFields': {
            userFollowingYouRel: { '$first': '$userFollowingYouRel' }
        }
    },

    // FILTER
    {
        '$match': {
            '$or': [
                // no user visibility, public group
                {
                    '$and': [
                        { "$expr": { '$not': "$userRel.visibility" } },
                        { "$expr": { '$eq': ["$group.privacy", "public"] } },
                        { "$expr": { '$eq': ["$userRel.isMember", true] } }
                    ]
                },
                // visibility: everyone, group not private
                {
                    '$and': [
                        { "$expr": { '$eq': ["$userRel.visibility", "everyone"] } },
                        { "$expr": { '$ne': ["$group.privacy", "private"] } }
                    ]
                },
                // no user visibility, private group
                {
                    '$and': [
                        { "$expr": { '$ne': ["$userRel.visibility", "self"] } },
                        { "$expr": { '$eq': ["$group.privacy", "private"] } },
                        { "$expr": { '$eq': ["$yourRel.isMember", true] } }
                    ]
                },
                // visibility: members
                {
                    '$and': [
                        { "$expr": { '$eq': ["$userRel.visibility", "members"] } },
                        { "$expr": { '$eq': ["$yourRel.isMember", true] } }
                    ]
                },
                // visibility: following
                {
                    '$and': [
                        { "$expr": { '$eq': ["$userRel.visibility", "following"] } },
                        { "$expr": { '$eq': ["$userFollowingYouRel.isFollowing", true] } }
                    ]
                },
                // visibility: self
                {
                    '$and': [
                        // { "$expr": { '$eq': ["$userRel.visibility", "self"] } }, // Always show to self
                        // { "$expr": { '$eq': ["$yourRel.userId", "$userRel.userId"] } },
                        {
                            '$expr': {
                                '$eq': ['$user', {
                                    '$toObjectId': new ObjectId(AuthUser._id)
                                }]
                            }
                        },
                    ]
                },
            ]
        }
    }];