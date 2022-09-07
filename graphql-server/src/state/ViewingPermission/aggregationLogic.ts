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

    // Question not Deleted
    {
        '$match':
        {
            '$expr': {
                '$ne': ['$question.status',  'deleted']
            }
        }
    },

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
    // TODO: replace with param: hasViewingPermission

    {
        '$addFields':
        {
            'visibility': {
                'noVisibility_publicGroup': {
                    '$and': [
                        { '$not': "$userRel.visibility" },
                        { '$eq': ["$group.privacy", "public"] },
                        { '$eq': ["$userRel.isMember", true] }
                    ]
                },
                'visibilityEveryone_groupNotPrivate': {
                    '$and': [
                        { '$eq': ["$userRel.visibility", "everyone"] },
                        { '$ne': ["$group.privacy", "private"] }
                    ]
                },
                'noVisibility_privateGroup_yourMember': {
                    '$and': [
                        { '$ne': ["$userRel.visibility", "self"] },
                        { '$eq': ["$group.privacy", "private"] },
                        { '$eq': ["$yourRel.isMember", true] }
                    ]
                },
                'visibilityMembers': {
                    '$and': [
                        { '$eq': ["$userRel.visibility", "members"] },
                        { '$eq': ["$yourRel.isMember", true] }
                    ]
                },
                'visibilityFollowing': {
                    '$and': [
                        { '$eq': ["$userRel.visibility", "following"] },
                        { '$eq': ["$userFollowingYouRel.isFollowing", true] }
                    ]
                },
                'visibilitySelf': {
                    '$and': [
                        {
                            '$eq': [{
                                '$toObjectId': '$userId'
                            }, {
                                '$toObjectId': new ObjectId(AuthUser._id)
                            }]
                        },
                    ]
                }
            }
        }
    },
    {
        '$addFields': {
            'visibility.hasViewingPermission': {
                '$or': [
                    { '$eq': ['$visibility.noVisibility_publicGroup', true] },
                    { '$eq': ['$visibility.visibilityEveryone_groupNotPrivate', true] },
                    { '$eq': ['$visibility.noVisibility_privateGroup_yourMember', true] },
                    { '$eq': ['$visibility.visibilityMembers', true] },
                    { '$eq': ['$visibility.visibilityFollowing', true] },
                    { '$eq': ['$visibility.visibilitySelf', true] },
                ]
            },
        }
    },
    {
        '$addFields': {
            "visibility.visibilityLevel": {
                "$cond": {
                    "if": {
                        "$or": [{
                            "$eq": ["$visibility.noVisibility_publicGroup", true]
                        }, {
                            "$eq": ["$visibility.visibilityEveryone_groupNotPrivate", true]
                        }]
                    },
                    "then": 1,
                    "else": {
                        "$cond": {
                            "if": {
                                "$or": [{
                                    "$eq": ["$visibility.noVisibility_privateGroup_yourMember", true]
                                }, {
                                    "$eq": ["$visibility.visibilityMembers", true]
                                }]
                            },
                            "then": 2,
                            "else": {
                                "$cond": {
                                    "if": {
                                        "$or": [{
                                            "$eq": ["$visibility.visibilityFollowing", true]
                                        }]
                                    },
                                    "then": 3,
                                    "else": {
                                        "$cond": {
                                            "if": {
                                                "$or": [{
                                                    "$eq": ["$visibility.visibilitySelf", true]
                                                }]
                                            },
                                            "then": 4,
                                            "else": 5
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    // {
    //     '$match': {
    //         '$or': [
    //             // no user visibility, public group
    //             {
    //                 '$and': [
    //                     { "$expr": { '$not': "$userRel.visibility" } },
    //                     { "$expr": { '$eq': ["$group.privacy", "public"] } },
    //                     { "$expr": { '$eq': ["$userRel.isMember", true] } }
    //                 ]
    //             },
    //             // visibility: everyone, group not private
    //             {
    //                 '$and': [
    //                     { "$expr": { '$eq': ["$userRel.visibility", "everyone"] } },
    //                     { "$expr": { '$ne': ["$group.privacy", "private"] } }
    //                 ]
    //             },
    //             // no user visibility, private group
    //             {
    //                 '$and': [
    //                     { "$expr": { '$ne': ["$userRel.visibility", "self"] } },
    //                     { "$expr": { '$eq': ["$group.privacy", "private"] } },
    //                     { "$expr": { '$eq': ["$yourRel.isMember", true] } }
    //                 ]
    //             },
    //             // visibility: members
    //             {
    //                 '$and': [
    //                     { "$expr": { '$eq': ["$userRel.visibility", "members"] } },
    //                     { "$expr": { '$eq': ["$yourRel.isMember", true] } }
    //                 ]
    //             },
    //             // visibility: following
    //             {
    //                 '$and': [
    //                     { "$expr": { '$eq': ["$userRel.visibility", "following"] } },
    //                     { "$expr": { '$eq': ["$userFollowingYouRel.isFollowing", true] } }
    //                 ]
    //             },
    //             // visibility: self
    //             {
    //                 '$and': [
    //                     // { "$expr": { '$eq': ["$userRel.visibility", "self"] } }, // Always show to self
    //                     // { "$expr": { '$eq': ["$yourRel.userId", "$userRel.userId"] } },
    //                     {
    //                         '$expr': {
    //                             '$eq': ['$userId', {
    //                                 '$toObjectId': new ObjectId(AuthUser._id)
    //                             }]
    //                         }
    //                     },
    //                 ]
    //             },
    //         ]
    //     }
    // }
];