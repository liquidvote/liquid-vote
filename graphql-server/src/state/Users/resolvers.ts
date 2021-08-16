import { ObjectID } from 'mongodb';

import { getGroupStats } from '../Groups/resolvers';

export const UserResolvers = {
    Query: {
        User: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return {
                ...User?.LiquidUser,
                isThisUser: !!AuthUser && AuthUser?.Auth0User?.sub === User?.Auth0User?.sub,
                isRepresentingYou: (await mongoDB.collection("UserRepresentations")
                    .find({
                        "representativeId": ObjectID(User._id),
                        "representeeId": ObjectID(AuthUser?._id),
                        "isRepresentingYou": true
                    }).count()) || 0,
                stats: await getUserStats({ userId: User._id, mongoDB }),
                ...!!AuthUser && (AuthUser._id.toString() !== User._id.toString()) && {
                    yourStats: await getYourUserStats({ userId: User._id, AuthUser, mongoDB }),
                }
            };
        },

        SearchUsers: async (_source, { text }, { mongoDB, s3, AuthUser }) => {

            const Users = await mongoDB.collection("Users")
                .find({
                    $or: [
                        { 'LiquidUser.handle': { $regex: text, $options: "i" } },
                        { 'LiquidUser.name': { $regex: text, $options: "i" } },
                    ],
                }).toArray();

            return Users?.map(u => u.LiquidUser) || [];
        },

        UserRepresenting: async (_source, { handle, groupHandle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const group = groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const representeesAndGroups = (
                await mongoDB.collection("UserRepresentations").aggregate(
                    [
                        {
                            $match: {
                                "representativeId": ObjectID(User?._id),
                                "isRepresentingYou": true,
                                ...group && {
                                    groupId: ObjectID(group._id)
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
                        }
                    ]
                ).toArray())
                .map(r => ({
                    ...r?.representeeUser[0]?.LiquidUser,
                    representationGroups: r?.groups
                }));

            return representeesAndGroups;
        },

        UserRepresentedBy: async (
            _source,
            { handle, groupHandle },
            { mongoDB, s3, AuthUser }
        ) => {
            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const group = groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const representativesAndGroups = (
                await mongoDB.collection("UserRepresentations").aggregate(
                    [
                        {
                            $match: {
                                "representeeId": ObjectID(User?._id),
                                "isRepresentingYou": true,
                                ...group && {
                                    groupId: ObjectID(group._id)
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
                        }
                    ]
                ).toArray())
                .map(r => ({
                    ...r?.representativeUser[0]?.LiquidUser,
                    representationGroups: r?.groups
                }));

            return representativesAndGroups;
        },

        UserGroups: async (_source, { handle, representative }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const UserGroupMemberRelations = await mongoDB.collection("GroupMembers")
                .find({ 'userId': ObjectID(User?._id) })
                .toArray();

            const YourGroupMemberRelations = !!AuthUser && await mongoDB.collection("GroupMembers")
                .find({
                    'userId': ObjectID(AuthUser?._id),
                    'groupId': {
                        "$in": UserGroupMemberRelations.map(
                            r => ObjectID(r.groupId)
                        )
                    }
                })
                .toArray();

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': representative });

            const RepresentativeGroupMemberRelations = !!AuthUser && await mongoDB.collection("GroupMembers")
                .find({
                    'userId': ObjectID(Representative?._id),
                    'groupId': {
                        "$in": UserGroupMemberRelations.map(
                            r => ObjectID(r.groupId)
                        )
                    }
                })
                .toArray();

            const Groups = await Promise.all((await mongoDB.collection("Groups").find({
                "_id": {
                    "$in": UserGroupMemberRelations.map(r => ObjectID(r.groupId))
                }
            })
                .toArray())
                .map(async (g) => ({
                    ...g,
                    thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                    stats: await getGroupStats({
                        groupHandle: g.handle,
                        groupId: g._id,
                        mongoDB
                    }),
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
                                    representativeId: ObjectID(Representative?._id),
                                    representeeId: ObjectID(User?._id),
                                    groupId: ObjectID(g?._id),
                                })
                        }
                    }))(RepresentativeGroupMemberRelations && RepresentativeGroupMemberRelations.find(
                        r => r.groupId.toString() === g._id.toString()
                    )),
                })));

            return Groups;
        },
        UserVotes: async (_source, { handle, type = 'directVotesMade' }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const votesInCommonGeneralAggregationLogic = (
                [{
                    '$match': {
                        'user': ObjectID(User._id),
                    }
                }, {
                    '$lookup': {
                        'from': 'Votes',
                        'let': {
                            'userId': ObjectID(AuthUser._id),
                            'questionText': '$questionText',
                            'choiceText': '$choiceText',
                            'group': '$group',
                            'channel': '$channel'
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
                                                    '$group', '$$group'
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$channel', '$$channel'
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        'as': 'yourVote'
                    }
                }, {
                    '$match': {
                        'yourVote': {
                            '$gte': {
                                '$size': 1
                            }
                        }
                    }
                }, {
                    '$addFields': {
                        'yourVote': {
                            '$first': '$yourVote'
                        }
                    }
                }, {
                    '$addFields': {
                        'bothDirect': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }, {
                                    '$eq': [
                                        '$yourVote.isDirect', true
                                    ]
                                }
                            ]
                        },
                        'InAgreement': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$position', '$yourVote.position'
                                    ]
                                }
                            ]
                        },
                        'yourVoteMadeByUser': {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$yourVote.representatives',
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
                        },
                        'yourVoteMadeForUser': {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$representatives',
                                            'as': 'r',
                                            'cond': {
                                                '$eq': [
                                                    '$$r.representativeId', '$yourVote.user'
                                                ]
                                            }
                                        }
                                    }
                                }, 1
                            ]
                        }
                    }
                },
                ]
            );

            const questionStatsAggregationLogic = (
                [
                    {
                        $lookup: {
                            from: 'Questions',
                            let: {
                                questionText: "$questionText",
                                choiceText: "$choiceText",
                                group: "$group",
                                channel: "$channel"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        // "questionText": "$$questionText",
                                        // not null
                                        $and: [
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
                                                        '$group', '$$group'
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$channel', '$$channel'
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ],
                            as: 'question'
                        }
                    },
                    {
                        $addFields: {
                            QuestionStats: { $first: '$question.stats' }
                        }
                    }
                ]
            );

            const representeeVotesAggregationLogic = (
                [
                    {
                        '$lookup': {
                            'from': 'Votes',
                            'let': {
                                'representativeId': { '$toObjectId': '$user' },
                                'questionText': '$questionText',
                                'choiceText': '$choiceText',
                                'group': '$groupChannel.group',
                                'channel': '$groupChannel.channel'
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
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$choiceText', '$$choiceText'
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$groupChannel.group', '$$group'
                                                    ]
                                                }
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$groupChannel.channel', '$$channel'
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }, {
                                    '$unwind': '$representatives'
                                }, {
                                    '$match': {
                                        '$expr': {
                                            '$eq': [
                                                '$representatives.representativeId', {
                                                    '$toObjectId': '$$representativeId'
                                                }
                                            ]
                                        }
                                    }
                                }, {
                                    '$lookup': {
                                        'from': 'Users',
                                        'localField': 'user',
                                        'foreignField': '_id',
                                        'as': 'user'
                                    }
                                },
                                {
                                    '$addFields': {
                                        'user': { '$first': '$user.LiquidUser' }
                                    }
                                }
                            ],
                            'as': 'representeeVotes'
                        }
                    }
                ]
            );

            const Votes = await (async (type) => {
                return {
                    'directVotesMade': async () => await mongoDB.collection("Votes")
                        // .find({ 'user': ObjectID(User?._id), 'isDirect': true })
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'isDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'directVotesInAgreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'InAgreement': true,
                                    'bothDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'directVotesInDisagreement': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'InAgreement': false,
                                    'bothDirect': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeForUser': async () => await mongoDB.collection("Votes")
                        // .find({ 'user': ObjectID(User?._id), 'isDirect': false })
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'isDirect': false
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeByYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'yourVoteMadeForUser': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                    'indirectVotesMadeForYou': async () => await mongoDB.collection("Votes")
                        .aggregate([
                            ...votesInCommonGeneralAggregationLogic,
                            {
                                '$match': {
                                    'yourVoteMadeByUser': true
                                }
                            },
                            ...representeeVotesAggregationLogic,
                            ...questionStatsAggregationLogic
                        ])
                        .toArray(),
                }[type]();
            })(type);

            return Votes;
        },
    },
    Mutation: {
        editUser: async (_source, { User }, { mongoDB, s3, AuthUser }) => {

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
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                )
            )?.value : null;

            return updated;
        },
        editGroupMemberChannelRelation: async (_source, {
            UserHandle,
            GroupHandle,
            Channels,
            IsMember
        }, { mongoDB, s3, AuthUser }) => {

            const isUser = !!AuthUser && AuthUser?.LiquidUser?.handle === UserHandle;

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': GroupHandle });

            const GroupsMemberRelation = await mongoDB.collection("GroupMembers")
                .findOne({
                    'userId': ObjectID(AuthUser._id),
                    'groupId': ObjectID(Group._id)
                });

            const updatedOrCreated = (isUser && !!GroupsMemberRelation) ? (
                await mongoDB.collection("GroupMembers").findOneAndUpdate(
                    { _id: GroupsMemberRelation._id },
                    {
                        $set: {
                            ...(typeof Channels !== 'undefined') && { 'channels': [...Channels] },
                            ...(typeof IsMember !== 'undefined') && { 'isMember': IsMember },
                            'lastEditOn': Date.now(),
                        },
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                )
            )?.value : isUser ? (
                await mongoDB.collection("GroupMembers").insertOne({
                    groupId: ObjectID(Group._id),
                    userId: ObjectID(AuthUser._id),
                    ...(typeof Channels !== 'undefined') && { 'channels': [...Channels] },
                    ...(typeof IsMember !== 'undefined') && { 'isMember': IsMember },
                    createdOn: Date.now(),
                    lastEditOn: Date.now(),
                })
            )?.ops[0] : null;

            return updatedOrCreated;
        },
        editUserRepresentativeGroupRelation: async (_source, {
            RepresenteeHandle,
            RepresentativeHandle,
            Group,
            IsRepresentingYou
        }, { mongoDB, s3, AuthUser }) => {

            const isUser = AuthUser?.LiquidUser?.handle === RepresenteeHandle;

            const Representee = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresenteeHandle });

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresentativeHandle });

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': Group });

            const RepresentativeGroupRelation = await mongoDB.collection("UserRepresentations")
                .findOne({
                    representativeId: ObjectID(Representative?._id),
                    representeeId: ObjectID(Representee?._id),
                    groupId: ObjectID(Group_?._id),
                });

            const updatedOrCreated = (isUser && !!RepresentativeGroupRelation) ? (
                await mongoDB.collection("UserRepresentations").findOneAndUpdate(
                    { _id: RepresentativeGroupRelation._id },
                    {
                        $set: {
                            isRepresentingYou: IsRepresentingYou,
                            'lastEditOn': Date.now(),
                        },
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                )
            )?.value : isUser ? (
                await mongoDB.collection("UserRepresentations").insertOne({
                    representativeId: ObjectID(Representative?._id),
                    representeeId: ObjectID(Representee?._id),
                    groupId: ObjectID(Group_?._id),
                    isRepresentingYou: IsRepresentingYou,
                    createdOn: Date.now(),
                    lastEditOn: Date.now(),
                })
            )?.ops[0] : null;

            return updatedOrCreated;
        },
    },
};

const getUserStats = async ({ userId, mongoDB }) => {

    return ({
        lastDirectVoteOn: 0, // TODO
        representing: (
            await mongoDB.collection("UserRepresentations").aggregate(
                [{
                    $match: {
                        "representeeId": ObjectID(userId),
                        "isRepresentingYou": true
                    }
                }, {
                    $group: {
                        _id: {
                            "representeeId": "$representeeId"
                        }
                    }
                }, {
                    $count: 'count'
                }]
            ).toArray())?.[0]?.count || 0,
        representedBy: (
            await mongoDB.collection("UserRepresentations").aggregate(
                [{
                    $match: {
                        "representativeId": ObjectID(userId),
                        "isRepresentingYou": true
                    }
                }, {
                    $group: {
                        _id: {
                            "representativeId": "$representativeId"
                        }
                    }
                }, {
                    $count: 'count'
                }]
            ).toArray())?.[0]?.count || 0,
        groupsJoined: await mongoDB.collection("GroupMembers")
            .find({
                "userId": ObjectID(userId),
                "isMember": true
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "isDirect": true,
                'position': { $ne: null },
                "user": ObjectID(userId)
            }).count(),
        indirectVotesMadeByUser: await mongoDB.collection("Votes")
            .find({
                "isDirect": false,
                "representatives.representativeId": ObjectID(userId)
            }).count(),
        indirectVotesMadeForUser: await mongoDB.collection("Votes")
            .find({
                "isDirect": false,
                "user": ObjectID(userId)
            }).count(),
    });
}

const getYourUserStats = async ({ userId, AuthUser, mongoDB }) => {

    const votesInCommon = (
        await mongoDB.collection("Votes")
            .aggregate([
                {
                    '$match': {
                        'user': ObjectID(AuthUser._id),
                        'position': { $ne: null }
                    }
                }, {
                    '$lookup': {
                        'from': 'Votes',
                        'let': {
                            'userId': userId,
                            'questionText': '$questionText',
                            'choiceText': '$choiceText',
                            'group': '$group',
                            'channel': '$channel'
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
                                                    '$group', '$$group'
                                                ]
                                            }
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$channel', '$$channel'
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        'as': 'otherVote'
                    }
                }, {
                    '$match': {
                        'otherVote': {
                            '$gte': {
                                '$size': 1
                            }
                        }
                    }
                }, {
                    '$addFields': {
                        'otherVote': {
                            '$first': '$otherVote'
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
                                        '$otherVote.isDirect', true
                                    ]
                                }
                            ]
                        },
                        'InAgreement': {
                            '$and': [
                                {
                                    '$eq': [
                                        '$position', '$otherVote.position'
                                    ]
                                }
                            ]
                        },
                        'otherVoteMadeByYou': {
                            '$gte': [
                                {
                                    '$size': {
                                        '$filter': {
                                            'input': '$otherVote.representatives',
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
                        },
                        'otherVoteMadeForYou': {
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
                                                            '$$r.representativeId', '$otherVote.user'
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
                                            '$otherVoteMadeByYou', true
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
                                            '$otherVoteMadeForYou', true
                                        ]
                                    }, 1, 0
                                ]
                            }
                        }
                    }
                }
            ])
            .toArray()
    )?.[0];

    return {
        votesInCommon: votesInCommon?.votesInCommon || 0, // count
        directVotesInCommon: votesInCommon?.directVotesInCommon || 0, // count it both direct

        directVotesInAgreement: votesInCommon?.directVotesInAgreement || 0, // count if positions differ & both direct
        directVotesInDisagreement: votesInCommon?.directVotesInDisagreement || 0, // count if positions differ & both direct

        indirectVotesMadeByYou: votesInCommon?.indirectVotesMadeByYou || 0, // count if user made indirect vote and you represented him
        indirectVotesMadeForYou: votesInCommon?.indirectVotesMadeForYou || 0, // count if you made an indirect vote and he represented you
    }
}