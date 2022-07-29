import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { getGroupStats } from '../Groups/resolvers';
import { updateInviteStatus } from '../Invites/resolvers';
import { updateRepresenteesVotes } from '../Votes/resolvers';
import { updateQuestionVotingStats } from '../Questions/resolvers';
import { QuestionsAgg } from '../Questions/aggregationLogic/QuestionsAgg';
import { votesInCommonPipelineForVotes } from './aggregationLogic/votesInCommonPipelineForVotes';
import { userRepresentedByComparissons } from './aggregationLogic/userRepresentedByComparissons';
import { userRepresentingComparissons } from './aggregationLogic/UserRepresentingComparissons';
import { userStatsAgg } from './aggregationLogic/userStats';
import { yourUserStatsAgg } from './aggregationLogic/yourUserStats';

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
                    email: User.email
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

            const isYou = handle === AuthUser?.LiquidUser?.handle;

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
                // get your member rel
                {
                    '$lookup': {
                        'as': 'yourRel',
                        'from': 'GroupMembers',
                        'let': {
                            'groupId': '$userRel.groupId',
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

                // get group
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
                        group: { '$first': '$group' }
                    }
                },

                // FILTER
                {
                    '$match': {
                        '$or': [
                            // no user visibility, public group
                            {
                                '$and': [
                                    { '$not': "$userRel.visibility" },
                                    { '$eq': ["$group.privacy", "public"] }
                                ]
                            },
                            // visibility: everyone, group not private
                            {
                                '$and': [
                                    { '$eq': ["$userRel.visibility", "everyone"] },
                                    { '$neq': ["$group.privacy", "private"] }
                                ]
                            },
                            // no user visibility,, private group
                            {
                                '$and': [
                                    { '$not': "$userRel.visibility" },
                                    { '$eq': ["$group.privacy", "private"] },
                                    { '$eq': ["$yourRel.isMember", true ] }
                                ]
                            },
                            // visibility: members
                            {
                                '$and': [
                                    { '$eq': ["$userRel.visibility", "members"] },
                                    { '$eq': ["$yourRel.isMember", true ] }
                                ]
                            },
                            // visibility: following
                            {
                                '$and': [
                                    { '$eq': ["$userRel.visibility", "following"] },
                                    { '$eq': ["$userFollowingYouRel.isFollowing", true ] }
                                ]
                            },
                            // visibility: self
                            {
                                '$and': [
                                    { '$eq': ["$userRel.visibility", "self"] },
                                    { '$eq': ["$yourRel.userId", "$userRel.userId" ] }
                                ]
                            },
                        ]
                    }
                },

                // TODO: get stats

                // TODO: sort

            ];


            const writeToDebugFile = fs.writeFile(
                process.cwd() + '/debug' + '/UserGroups.json',
                JSON.stringify(UserGroupsAggFromGroupMembers, null, 2),
                { encoding: 'utf8' }
            );

            // const NotUsersAgg
            // Not Users &&liquidVoteApproved

            const UserGroupMemberRelations = !!User && await mongoDB.collection("GroupMembers")
                .find({ 'userId': new ObjectId(User?._id), 'isMember': true })
                .toArray();

            const YourGroupMemberRelations = (!!AuthUser && !!UserGroupMemberRelations) &&
                await mongoDB.collection("GroupMembers")
                    .find({
                        'userId': new ObjectId(AuthUser?._id),
                        'groupId': {
                            "$in": UserGroupMemberRelations.map(
                                r => new ObjectId(r.groupId)
                            )
                        },
                        'isMember': true
                    })
                    .toArray();


            // visibility: self
            // is self

            // visibility: following

            // visibility: members
            // you are member && visibility: members

            // visibility: everyOne
            // or visibility: undefined && group: public

            // notUsers && liquidVoteApproved

            const RepresentativeGroupMemberRelations = !!AuthUser && await mongoDB.collection("GroupMembers")
                .find({
                    'userId': new ObjectId(Representative?._id),
                    ...!!UserGroupMemberRelations && {
                        'groupId': {
                            "$in": UserGroupMemberRelations.map(
                                r => new ObjectId(r.groupId)
                            )
                        },
                        'isMember': true
                    },
                })
                .toArray();

            const Groups = await Promise.all((
                (await mongoDB.collection("Groups").aggregate([
                    // {
                    //     '$match': {
                    //         ...!!UserGroupMemberRelations && {
                    //             "_id": {
                    //                 [`${notUsers ? '$nin' : '$in'}`]: UserGroupMemberRelations.map(r => new ObjectId(r.groupId))
                    //             },
                    //         },
                    //         ...(notUsers || !(!!handle)) && {
                    //             privacy: 'public'
                    //         }
                    //     },
                    // },
                    // filter out Non Public UserGroups you don't belong to
                    {
                        '$match': {
                            $and: [
                                ...!!UserGroupMemberRelations ? [{
                                    "_id": {
                                        [`${notUsers ? '$nin' : '$in'}`]: UserGroupMemberRelations.map(r => new ObjectId(r.groupId))
                                    },
                                }] : [],
                                {
                                    $or: [
                                        { privacy: 'public' },  // and visibility: everyone
                                        // you are member && visibility: members 
                                        ...!!YourGroupMemberRelations ? [
                                            { '_id': { '$in': YourGroupMemberRelations.map(r => new ObjectId(r.groupId)) } }
                                        ] : []
                                        // is self && visibility: self
                                    ]
                                }
                            ]
                        }
                    },
                    // ...userStatsAgg({ groupHandle, groupId: group._id }),
                    {
                        '$lookup': {
                            'as': 'directVotesMadeByUser',
                            'from': 'Votes',
                            'let': {
                                'userId': new ObjectId(User?._id),
                                'groupHandle': '$handle'
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
                    },
                    {
                        '$addFields': {
                            'userStats': {
                                'directVotesMade': {
                                    $size: '$directVotesMadeByUser'
                                }
                            }
                        }
                    },
                    {
                        $sort: { 'userStats.directVotesMade': -1 }
                    },
                    //  On Your Groups - membersYouFollow
                    ...(!!AuthUser?._id && handle === AuthUser?.LiquidUser.handle) ? [
                        {
                            '$lookup': {
                                as: "membersYouFollow",
                                from: "UserFollows",
                                let: {
                                    'loggedInUser': new ObjectId(AuthUser._id),
                                    'groupId': '$_id',
                                    'groupHandle': '$handle'
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
                                }, { //
                                    '$lookup': {
                                        'as': 'yourStats',
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
                                                                    '$user', new ObjectId(AuthUser._id)
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
                                },]
                            },
                        },
                        {
                            '$addFields': {
                                'yourStats': { 'membersYouFollow': '$membersYouFollow' }
                            }
                        },
                    ] : [],
                    //  On Another User's Groups
                    ...(!!AuthUser?._id && handle !== AuthUser?.LiquidUser.handle) ? [
                        {
                            '$lookup': {
                                'as': 'yourUserStats',
                                'from': 'Votes',
                                'let': {
                                    'userId': new ObjectId(User._id),
                                    'groupHandle': '$handle'
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
                                'yourUserStats': { '$first': '$yourUserStats' }
                            }
                        },
                        // {
                        //     $sort: { 'yourUserStats.directVotesInCommon': -1 }
                        // }
                    ] : [],
                ])
                    .toArray())
                    .map(async (g) => ({
                        ...g,
                        thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                        stats: await getGroupStats({
                            groupHandle: g.handle,
                            groupId: g._id,
                            mongoDB,
                            AuthUser
                        }),
                        ...!!UserGroupMemberRelations && {
                            userMemberRelation: UserGroupMemberRelations?.find(
                                r => r.groupId.toString() === g._id.toString()
                            ),
                            yourMemberRelation: YourGroupMemberRelations && YourGroupMemberRelations.find(
                                r => r.groupId.toString() === g._id.toString()
                            ),
                            representativeRelation: await (async r => ({
                                isGroupMember: !!r && r?.isMember,
                                ...(!!r) && {
                                    ... await mongoDB.collection("UserRepresentations")
                                        .findOne({
                                            representativeId: new ObjectId(Representative?._id),
                                            representeeId: new ObjectId(AuthUser?._id),
                                            groupId: new ObjectId(g?._id),
                                        })
                                }
                            }))(RepresentativeGroupMemberRelations && RepresentativeGroupMemberRelations.find(
                                r => r.groupId.toString() === g._id.toString()
                            )),
                            youToHimRepresentativeRelation: await (async r => ({
                                isGroupMember: !!r && r?.isMember,
                                ...(!!r) && {
                                    ... await mongoDB.collection("UserRepresentations")
                                        .findOne({
                                            representativeId: new ObjectId(AuthUser?._id),
                                            representeeId: new ObjectId(Representative?._id),
                                            groupId: new ObjectId(g?._id),
                                        })
                                }
                            }))(RepresentativeGroupMemberRelations && RepresentativeGroupMemberRelations.find(
                                r => r.groupId.toString() === g._id.toString()
                            )),
                            yourUserStats: g.yourUserStats,
                            userStats: g.userStats,
                            yourStats: g.yourStats      //TODO: are these really needed here?
                        }
                    }))));

            // console.log({ GroupsR: Groups.map(r => r.representativeRelation) });

            return Groups;
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

            console.log({ Users });

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

            return {
                id: UpdatedUserFollowingRelation._id,
                ...UpdatedUserFollowingRelation
            };
        },
    },
};