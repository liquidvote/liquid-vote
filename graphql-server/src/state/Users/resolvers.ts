import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { updateInviteStatus } from '../Invites/resolvers';
import { updateRepresenteesVotes } from '../Votes/resolvers';
import { updateQuestionVotingStats } from '../Questions/resolvers';
import { userRepresentedByComparissons } from './aggregationLogic/userRepresentedByComparissons';
import { userRepresentingComparissons } from './aggregationLogic/UserRepresentingComparissons';
import { userStatsAgg } from './aggregationLogic/userStats';
import { yourUserStatsAgg } from './aggregationLogic/yourUserStats';
import { yourGroupStats, groupStats, userGroupStats } from '../Groups/aggregationLogic';
import { canViewUsersVoteOrCause } from "../ViewingPermission/aggregationLogic";
import { saveAndSendNotification } from "../Notifications/resolvers";

export const UserResolvers = {
    Query: {
        User: async (_source, { handle, groupHandle }, { mongoDB, AuthUser }) => {

            const group = !!groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const UserAgg = [
                {
                    '$match': {
                        'LiquidUser.handle': handle
                    }
                },
                // isFollowingYou & isYouFollowing
                ...(!!AuthUser?._id) ? [{
                    '$lookup': {
                        'as': 'isFollowingYou',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': new ObjectId(AuthUser._id),
                            'followingId': '$_id',
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }, {
                    '$lookup': {
                        'as': 'isYouFollowing',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': '$_id',
                            'followingId': new ObjectId(AuthUser._id),
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }] : [],
                ...userStatsAgg({ groupHandle: null, groupId: null }),
                ...(!!AuthUser?._id) ? [...yourUserStatsAgg({ AuthUser, groupHandle: null })] : [],
                ...(!!groupHandle) ? [
                    // groupStats.stats & groupStats.yourStats
                    ...userStatsAgg({ groupHandle, groupId: group._id }),
                    ...yourUserStatsAgg({ AuthUser, groupHandle })
                ] : [],
                // isRepresentingYou
                ...(!!AuthUser?._id) ? [{
                    '$lookup': {
                        'as': 'isRepresentingYou',
                        'from': 'UserRepresentations',
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
                                                    '$representativeId', {
                                                        '$toObjectId': '$$userId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$representeeId', {
                                                        '$toObjectId': ObjectId(AuthUser._id)
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isRepresentingYou', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }] : [],
            ]

            const User = (await mongoDB.collection("Users")
                .aggregate(UserAgg).toArray()
            )?.[0];


            // const writeToDebugFile = fs.writeFile(
            //     process.cwd() + '/debug' + '/User.json',
            //     JSON.stringify({ UserAgg }, null, 2),
            //     { encoding: 'utf8' }
            // );

            const isUser = !!AuthUser && AuthUser?._id?.toString() === User?._id?.toString();

            return !!User ? {
                id: User?.LiquidUser?.handle + groupHandle,
                ...User?.LiquidUser,
                ...isUser ? {
                    email: User?.LiquidUser?.email
                } : {
                    email: null
                },
                isThisUser: !!AuthUser && AuthUser?.Auth0User?.sub === User?.Auth0User?.sub,
                isRepresentingYou: User?.isRepresentingYou?.length || 0,
                stats: {
                    id: User?.LiquidUser?.handle,
                    ...User?.stats
                },
                ...!!AuthUser && (!isUser) && {
                    yourStats: {
                        id: User?.LiquidUser?.handle,
                        ...User?.yourStats
                    }
                },
                ...!!groupHandle && {
                    groupStats: {
                        stats: User?.groupStats?.stats,
                        ...(!isUser) && {
                            yourStats: User?.groupStats?.yourStats,
                        }
                    },
                },
                isFollowingYou: User.isFollowingYou?.length === 1,
                isYouFollowing: User.isYouFollowing?.length === 1,
            } : {};
        },
        SearchUsers: async (_source, {
            text,
            notInGroup,
            inGroup
        }, { mongoDB, AuthUser }) => {

            const Group = (notInGroup || inGroup) && await mongoDB.collection("Groups")
                .findOne({ 'handle': notInGroup || inGroup });

            const Users = await mongoDB.collection("Users")
                .aggregate([
                    {
                        '$match': {
                            '$or': [
                                {
                                    'LiquidUser.handle': {
                                        '$regex': text,
                                        '$options': 'i'
                                    }
                                }, {
                                    'LiquidUser.name': {
                                        '$regex': text,
                                        '$options': 'i'
                                    }
                                }, {
                                    'LiquidUser.email': text
                                }
                            ]
                        }
                    },
                    ...(notInGroup || inGroup) ? [
                        {
                            '$lookup': {
                                'from': 'GroupMembers',
                                'let': {
                                    'memberId': '$_id'
                                },
                                'pipeline': [
                                    {
                                        '$match': {
                                            '$and': [
                                                {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$userId', '$$memberId'
                                                        ]
                                                    }
                                                }, {
                                                    '$expr': {
                                                        '$eq': [
                                                            '$groupId', new ObjectId(Group?._id)
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ],
                                'as': 'groupMemberRelation'
                            }
                        }, {
                            '$addFields': {
                                'isMember': {
                                    '$gt': [
                                        {
                                            '$size': '$groupMemberRelation'
                                        }, 0
                                    ]
                                }
                            }
                        }, {
                            '$match': {
                                'isMember': notInGroup ? false : true
                            }
                        }
                    ] : [],
                ])
                .toArray();

            return Users?.map(u => u.LiquidUser) || [];
        },
        UserRepresenting: async (_source, { handle, groupHandle }, { mongoDB, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const group = !!groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const representeesAndGroups = (
                await mongoDB.collection("UserRepresentations").aggregate(
                    [
                        {
                            $match: {
                                "representativeId": new ObjectId(User?._id),
                                "isRepresentingYou": true,
                                ...!!group && {
                                    groupId: new ObjectId(group._id)
                                }
                            }
                        }, {
                            $group: {
                                _id: {
                                    representee: '$representeeId'
                                },
                                count: {
                                    $sum: 1
                                },
                                groups: {
                                    $push: "$groupId"
                                }
                            }
                        }, {
                            $lookup: {
                                from: 'Groups',
                                localField: 'groups',
                                foreignField: '_id',
                                as: 'groups'
                            }
                        }, {
                            $lookup: {
                                from: 'Users',
                                localField: '_id.representee',
                                foreignField: '_id',
                                as: 'representeeUser'
                            }
                        },
                        ...(!!AuthUser._id) ? [
                            ...userRepresentingComparissons({ groupHandle, AuthUserId: AuthUser._id })
                        ] : []
                    ]
                ).toArray())
                .map(r => {
                    return {
                        ...r?.representeeUser[0]?.LiquidUser,
                        representationGroups: r?.groups,
                        stats: r?.stats,
                        yourStats: r?.yourStats,
                        email: null
                    }
                });

            return representeesAndGroups;
        },
        UserRepresentedBy: async (
            _source,
            { handle, groupHandle, representativeHandle },
            { mongoDB, AuthUser }
        ) => {
            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const RepresentativeUser = !!representativeHandle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': representativeHandle });

            const group = !!groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const representativesAndGroupsAgg = [
                {
                    $match: {
                        "representeeId": new ObjectId(User?._id),
                        "isRepresentingYou": true,
                        ...!!group && {
                            groupId: new ObjectId(group._id)
                        },
                        ...!!RepresentativeUser && {
                            representativeId: new ObjectId(RepresentativeUser._id)
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            representative: '$representativeId'
                        },
                        count: {
                            $sum: 1
                        },
                        groups: {
                            $push: "$groupId"
                        }
                    }
                }, {
                    $lookup: {
                        from: 'Groups',
                        localField: 'groups',
                        foreignField: '_id',
                        as: 'groups'
                    }
                }, {
                    $lookup: {
                        from: 'Users',
                        localField: '_id.representative',
                        foreignField: '_id',
                        as: 'representativeUser'
                    }
                },
                ...(!!AuthUser._id) ? [
                    ...userRepresentedByComparissons({ groupHandle, AuthUserId: AuthUser._id })
                ] : []
            ];

            const representativesAndGroups = (
                await mongoDB.collection("UserRepresentations").aggregate(representativesAndGroupsAgg).toArray())
                .map(r => ({
                    ...r?.representativeUser[0]?.LiquidUser,
                    representationGroups: r?.groups,
                    stats: r?.stats,
                    yourStats: r?.yourStats,
                    email: null
                }));

            // const writeToDebugFile = fs.writeFile(
            //     process.cwd() + '/debug' + '/representativesAndGroups.json',
            //     JSON.stringify({
            //         QueryJSON: representativesAndGroupsAgg,
            //     }, null, 2),
            //     { encoding: 'utf8' }
            // );

            return representativesAndGroups;
        },
        UserGroups: async (_source, { handle, representative, notUsers }, { mongoDB, AuthUser }) => {

            const User = !!handle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': representative });

            const UserGroupsAggFromGroupMembers = [
                // get user member rel
                {
                    '$match': {
                        'userId': new ObjectId(User?._id),
                        'isMember': true
                    },
                },
                {
                    '$replaceRoot': {
                        newRoot: {
                            userRel: "$$ROOT"
                        }
                    }
                },

                {
                    '$lookup': {
                        'as': 'group',
                        'from': 'Groups',
                        'let': {
                            'groupId': '$userRel.groupId',
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': ['$_id', {
                                                    '$toObjectId': '$$groupId'
                                                }]
                                            }
                                        },
                                    ]
                                }
                            }
                        ],
                    }
                },
                {
                    '$addFields': {
                        group: { '$first': '$group' },
                        userId: new ObjectId(User?._id),
                    }
                },
                ...canViewUsersVoteOrCause({ AuthUser }),
                {
                    '$match': {
                        'visibility.hasViewingPermission': true
                    }
                },

                ...Representative ? [
                    // representativeRelation
                    {
                        '$lookup': {
                            'as': 'representativeRel',
                            'from': 'UserRepresentations',
                            'let': {
                                'groupId': '$userRel.groupId',
                                'representeeId': new ObjectId(AuthUser?._id),
                                'representativeId': new ObjectId(Representative?._id),
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$and': [
                                            {
                                                '$expr': {
                                                    '$eq': ['$representeeId', {
                                                        '$toObjectId': '$$representeeId'
                                                    }]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': ['$representativeId', {
                                                        '$toObjectId': '$$representativeId'
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
                                        ]
                                    }
                                }
                            ],
                        }
                    },
                    {
                        '$addFields': {
                            representativeRel: { '$first': '$representativeRel' }
                        }
                    },
                    // youToHimRepresentativeRelation
                    {
                        '$lookup': {
                            'as': 'youToHimRepresentativeRel',
                            'from': 'UserRepresentations',
                            'let': {
                                'groupId': '$userRel.groupId',
                                'representeeId': new ObjectId(Representative?._id),
                                'representativeId': new ObjectId(AuthUser?._id),
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$and': [
                                            {
                                                '$expr': {
                                                    '$eq': ['$representeeId', {
                                                        '$toObjectId': '$$representeeId'
                                                    }]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': ['$representativeId', {
                                                        '$toObjectId': '$$representativeId'
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
                                        ]
                                    }
                                }
                            ],
                        }
                    },
                    {
                        '$addFields': {
                            youToHimRepresentativeRel: { '$first': '$youToHimRepresentativeRel' }
                        }
                    },
                ] : [],

                // get stats
                ...yourGroupStats(AuthUser),
                ...groupStats(),
                ...userGroupStats({ userId: User._id }),

                // sort
                ...handle ? [{
                    $sort: { 'userGroupStats.inverseDaysAgoSum': -1 },
                }, {
                    $sort: { 'visibility.visibilityLevel': 1 }
                }] : AuthUser ? [{
                    $sort: { 'yourStats.membersYouFollowCount': -1 }
                }] : [{
                    $sort: { 'stats.members': -1 }
                }]

            ];

            const NotUsersGroupsAgg = [
                {
                    '$replaceRoot': {
                        newRoot: {
                            group: "$$ROOT"
                        }
                    }
                },
                // yourRel
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

                {
                    '$match': {
                        '$and': [
                            { "$expr": { '$ne': ["$yourRel.isMember", true] } },
                            { "$expr": { '$eq': ["$group.privacy", "public"] } },
                            { "$expr": { '$eq': ["$group.adminApproved", true] } }
                        ]
                    }
                },

                // get stats
                ...yourGroupStats(AuthUser),
                ...groupStats(),

            ];

            // const writeToDebugFile = fs.writeFile(
            //     process.cwd() + '/debug' + '/UserGroups.json',
            //     JSON.stringify(UserGroupsAggFromGroupMembers, null, 2),
            //     { encoding: 'utf8' }
            // );

            // TODO: this could go into the Agg
            // const VisibilitySortOrder = {
            //     'everyone': 1,
            //     'members': 2,
            //     'following': 3,
            //     'self': 4,
            //     'none': 5
            // };

            const UserGroups = !notUsers && (
                await mongoDB.collection("GroupMembers").aggregate(UserGroupsAggFromGroupMembers
                ).toArray())
                // .map(
                //     (g) => {

                //         console.log({
                //             v: VisibilitySortOrder[g?.userRel?.visibility || 'none'],
                //             vv: g?.userRel?.visibility
                //         });

                //         return g;
                //     }
                // )
                .map((g) => ({
                    ...g.group,
                    thisUserIsAdmin: !!g.group?.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                    userMemberRelation: g.userRel,
                    yourMemberRelation: g.yourRel,
                    representativeRelation: g.representativeRel,
                    youToHimRepresentativeRelation: g.youToHimRepresentativeRel,

                    stats: g.groupStats,
                    yourUserStats: null,
                    userStats: g.userGroupStats,
                    yourStats: g.yourGroupStats,
                }));

            const NotUsersGroups = notUsers && (await mongoDB.collection("Groups").aggregate(NotUsersGroupsAgg)
                .toArray()).map((g) => ({
                    ...g.group,
                    yourMemberRelation: g.yourRel,

                    stats: g.groupStats,
                    yourStats: g.yourGroupStats,
                }));

            // const writeToDebugFile2 = fs.writeFile(
            //     process.cwd() + '/debug' + '/NotUsersGroups.json',
            //     JSON.stringify(NotUsersGroupsAgg, null, 2),
            //     { encoding: 'utf8' }
            // );

            // console.log({ notUsers, NotUsersGroups });

            return notUsers ? NotUsersGroups : UserGroups;
        },
        UserFollowing: async (_source, { handle }, { mongoDB, AuthUser }) => {
            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const Agg = [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$followingId', {
                                            '$toObjectId': ObjectId(User._id)
                                        }
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$isFollowing', true
                                    ]
                                }
                            },
                        ],
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
                },
                {
                    '$replaceRoot': {
                        newRoot: {
                            $mergeObjects: [
                                { _id: "$_id" },
                                "$LiquidUser"
                            ]
                        }
                    }
                },
                // isFollowingYou & isYouFollowing
                ...(!!AuthUser?._id) ? [{
                    '$lookup': {
                        'as': 'isFollowingYou',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': new ObjectId(AuthUser._id),
                            'followingId': '$_id',
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }, {
                    '$lookup': {
                        'as': 'isYouFollowing',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': '$_id',
                            'followingId': new ObjectId(AuthUser._id),
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }] : [],
            ];

            const Users = (await mongoDB.collection("UserFollows")
                .aggregate(Agg).toArray()
            );

            // console.log({ Users });

            return Users.map(u => ({ ...u, email: null }));
        },
        UserFollowedBy: async (_source, { handle }, { mongoDB, AuthUser }) => {
            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const Agg = [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$followedId', {
                                            '$toObjectId': ObjectId(User._id)
                                        }
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$isFollowing', true
                                    ]
                                }
                            },
                        ],
                    }
                },
                {
                    "$lookup": {
                        "as": "user",
                        "from": "Users",
                        let: {
                            'followingId': '$followingId',
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    '$and': [
                                        { "$expr": { "$eq": ["$_id", "$$followingId"] } }
                                    ]
                                }
                            }
                        ],
                    }
                }, {
                    "$replaceRoot": { newRoot: { "$first": "$user" } }
                },
                {
                    '$replaceRoot': {
                        newRoot: {
                            $mergeObjects: [
                                { _id: "$_id" },
                                "$LiquidUser"
                            ]
                        }
                    }
                },
                // isFollowingYou & isYouFollowing
                ...(!!AuthUser?._id) ? [{
                    '$lookup': {
                        'as': 'isFollowingYou',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': new ObjectId(AuthUser._id),
                            'followingId': '$_id',
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }, {
                    '$lookup': {
                        'as': 'isYouFollowing',
                        'from': 'UserFollows',
                        'let': {
                            'followedId': '$_id',
                            'followingId': new ObjectId(AuthUser._id),
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$and': [
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followedId', {
                                                        '$toObjectId': '$$followedId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$followingId', {
                                                        '$toObjectId': '$$followingId'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$isFollowing', true
                                                ]
                                            }
                                        },
                                    ],
                                }
                            },
                        ]
                    },
                }] : [],
            ];

            const Users = (await mongoDB.collection("UserFollows")
                .aggregate(Agg).toArray()
            );
            return Users.map(u => ({ ...u, email: null }));
        },
    },
    Mutation: {
        editUser: async (_source, { User }, { mongoDB, AuthUser }) => {

            if (!AuthUser) return;

            const updated = (AuthUser && User) ? (
                await mongoDB.collection("Users").findOneAndUpdate(
                    { _id: AuthUser._id },
                    {
                        $set: {
                            'LiquidUser.name': User.name,
                            'LiquidUser.location': User.location,
                            'LiquidUser.bio': User.bio,
                            'LiquidUser.externalLink': User.externalLink,
                            'LiquidUser.avatar': User.avatar,
                            'LiquidUser.cover': User.cover,
                            'LiquidUser.email': User.email,
                            'LiquidUser.lastEditOn': Date.now(),
                        },
                    },
                    { returnDocument: 'after' }
                )
            )?.value : null;

            return updated;
        },
        editGroupMemberChannelRelation: async (_source, {
            UserHandle,
            GroupHandle,
            Channels,
            IsMember,
            InviteId,
            Visibility
        }, { mongoDB, AuthUser }) => {

            if (!AuthUser) return;

            // console.log({
            //     UserHandle,
            //     GroupHandle,
            //     Channels,
            //     IsMember,
            //     InviteId
            // })

            const isUser = !!AuthUser && AuthUser?.LiquidUser?.handle === UserHandle;

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': GroupHandle });

            const GroupsMemberRelation = await mongoDB.collection("GroupMembers")
                .findOne({
                    'userId': new ObjectId(AuthUser._id),
                    'groupId': new ObjectId(Group._id)
                });

            const updatedOrCreated = (isUser && !!GroupsMemberRelation) ? (
                await mongoDB.collection("GroupMembers").findOneAndUpdate(
                    { _id: GroupsMemberRelation._id },
                    {
                        $set: {
                            ...(typeof Channels !== 'undefined') && { 'channels': [...Channels] },
                            ...(typeof IsMember !== 'undefined') && { 'isMember': IsMember },
                            ...(typeof Visibility !== 'undefined') && { 'visibility': Visibility },
                            'lastEditOn': Date.now(),
                        },
                    },
                    { returnDocument: 'after' }
                )
            )?.value : isUser ? (
                await mongoDB.collection("GroupMembers").insertOne({
                    groupId: new ObjectId(Group._id),
                    userId: new ObjectId(AuthUser._id),
                    ...(typeof Channels !== 'undefined') && { 'channels': [...Channels] },
                    ...(typeof IsMember !== 'undefined') && { 'isMember': IsMember },
                    createdOn: Date.now(),
                    lastEditOn: Date.now(),
                })
            )?.ops[0] : null;

            // TODO: use this
            if (InviteId) {
                updateInviteStatus({
                    InviteId,
                    to: 'accepted',
                    mongoDB
                })
            }

            return updatedOrCreated;
        },
        editUserRepresentativeGroupRelation: async (_source, {
            RepresenteeHandle,
            RepresentativeHandle,
            Group,
            IsRepresentingYou
        }, { mongoDB, AuthUser }) => {

            if (!AuthUser) return;

            const isUser = AuthUser?.LiquidUser?.handle === RepresenteeHandle;

            const Representee = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresenteeHandle });

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresentativeHandle });

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': Group });

            const UpdatedRepresentativeGroupRelation = isUser ? (
                await mongoDB.collection("UserRepresentations").findOneAndUpdate(
                    {
                        representativeId: new ObjectId(Representative?._id),
                        representeeId: new ObjectId(Representee?._id),
                        groupId: new ObjectId(Group_?._id),
                    },
                    {
                        $set: {
                            isRepresentingYou: IsRepresentingYou,
                            lastEditOn: Date.now(),
                        },
                        $setOnInsert: {
                            representativeId: new ObjectId(Representative?._id),
                            representeeId: new ObjectId(Representee?._id),
                            groupId: new ObjectId(Group_?._id),
                            createdOn: Date.now()
                        }
                    },
                    {
                        returnDocument: 'after',
                        upsert: true
                    }
                )
            )?.value : null;


            const updatedRepresenteesVotes = await updateRepresenteesVotes({
                efficientOrThorough: "thorough",

                representeeId: Representee._id,
                representativeId: Representative._id,
                isRepresentingYou: IsRepresentingYou, // false, for when removing vote
                groupId: Group_._id,
                groupHandle: Group_.handle,

                AuthUser,
                mongoDB,
            });

            // console.log({
            //     UpdatedRepresentativeGroupRelation,
            //     updatedRepresenteesVotesL: updatedRepresenteesVotes?.length
            // });

            const updatedQuestionStats = await Promise.all(updatedRepresenteesVotes.map(async (q: any) => {
                return await updateQuestionVotingStats({
                    questionText: q.questionText,
                    choiceText: q.choiceText,
                    group: q.groupChannel.group,

                    mongoDB,
                    AuthUser
                });
            }));

            console.log({
                updatedQuestionStatsL: updatedQuestionStats?.length
            });

            // update/create votes for representee, from representative's votes

            return UpdatedRepresentativeGroupRelation;
        },
        editUserFollowingRelation: async (_source, {
            FollowedHandle,
            FollowingHandle,
            IsFollowing
        }, { mongoDB, AuthUser }) => {

            if (!AuthUser) return;

            const isFollower = AuthUser?.LiquidUser?.handle === FollowingHandle;

            const FollowedUser = await mongoDB.collection("Users").findOne({ 'LiquidUser.handle': FollowedHandle });

            const UpdatedUserFollowingRelation = isFollower ? (
                await mongoDB.collection("UserFollows").findOneAndUpdate(
                    {
                        followedId: new ObjectId(FollowedUser._id),
                        followingId: new ObjectId(AuthUser._id)
                    },
                    {
                        $set: {
                            isFollowing: IsFollowing,
                            lastEditOn: Date.now(),
                        },
                        $setOnInsert: {
                            followedId: new ObjectId(FollowedUser._id),
                            followingId: new ObjectId(AuthUser._id),
                            createdOn: Date.now()
                        }
                    },
                    {
                        returnDocument: 'after',
                        upsert: true
                    }
                )
            )?.value : null;

            const notification = UpdatedUserFollowingRelation?.isFollowing ?
                await saveAndSendNotification({
                    type: 'followed_you',
                    toUser: FollowedUser,
                    toUserHandle: null,
                    actionUser: AuthUser,
                    actionUserHandle: null,
                    question: null,
                    questionText: null,
                    choiceText: null,
                    group: null,
                    groupHandle: null,
                    agreesWithYou: null,
                    userHandle: null,
                    inviterUser: null,
                    inviteLink: null,

                    mongoDB,
                    AuthUser
                }) : null;

            return {
                id: UpdatedUserFollowingRelation._id,
                ...UpdatedUserFollowingRelation
            };
        },
        editAdminStatus: async (_source, { UserHandle, NewStatus }, { mongoDB, AuthUser }) => {

            if (!AuthUser || AuthUser?.LiquidUser?.admin !== 'total') return;

            const User = await mongoDB.collection("Users").findOne({ 'LiquidUser.handle': UserHandle });

            const updated = (AuthUser && User) ? (
                await mongoDB.collection("Users").findOneAndUpdate(
                    { _id: User._id },
                    {
                        $set: {
                            'LiquidUser.admin': NewStatus,
                            'LiquidUser.lastAdminEditOn': Date.now(),
                        },
                    },
                    { returnDocument: 'after' }
                )
            )?.value : null;

            return updated;
        },
    },
};