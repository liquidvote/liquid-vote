import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from './votesInCommonPipelineForVotes';

export const yourUserStatsAgg = ({ AuthUser, groupHandle }) => [
    {
        '$lookup': {
            'as': 'yourStats_',
            'from': 'Votes',
            'let': {
                'userId': '$_id',
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', new ObjectId(AuthUser._id)
                                    ]
                                }
                            },
                            ...(!!groupHandle) ? [
                                {
                                    '$expr': {
                                        '$eq': ['$groupChannel.group', groupHandle]
                                    }
                                }
                            ] : [],
                        ],
                    }
                },

                ...votesInCommonPipelineForVotes(),
            ]
        },
    },

    {
        '$lookup': {
            as: "yourStats_followersYouFollow",
            from: "UserFollows",
            let: {
                'userId': '$_id',
                'loggedInUser': new ObjectId(AuthUser._id),
            },
            'pipeline': [
                {
                    "$match": {
                        '$and': [
                            { "$expr": { "$eq": ['$followedId', '$$userId'] } },
                            { "$expr": { "$eq": ["$isFollowing", true] } }
                        ]
                    }
                }, {
                    "$lookup": {
                        "as": "follower",
                        "from": "UserFollows",
                        let: {
                            'followedId': '$followingId',
                            'loggedInUser': '$$loggedInUser',
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    '$and': [
                                        { "$expr": { "$eq": ['$followedId', '$$followedId'] } },
                                        { "$expr": { "$eq": ["$followingId", "$$loggedInUser"] } },
                                        { "$expr": { "$eq": ["$isFollowing", true] } }
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
                                { "$size": "$follower" }, 1
                            ]
                        }
                    }
                },
                {
                    "$lookup": {
                        "as": "user",
                        "from": "Users",
                        let: {
                            'followedId': '$followingId',
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
                }
            ]
        },
    },


    ...(!groupHandle) ? [
        {
            '$addFields': {
                'yourStats': { '$first': '$yourStats_' }
            }
        },
        {
            '$addFields': {
                'yourStats.followersYouFollow': '$yourStats_followersYouFollow'
            }
        }
    ] : [{
        '$addFields': {
            'groupStats.yourStats': { '$first': '$yourStats_' }
        }
    }],
]