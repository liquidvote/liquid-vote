import { ObjectId } from 'mongodb';

import { getGroupStats } from '../Groups/resolvers';
import { updateInviteStatus } from '../Invites/resolvers';

export const UserResolvers = {
    Query: {
        User: async (_source, { handle }, { mongoDB, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return !!User ? {
                ...User?.LiquidUser,
                isThisUser: !!AuthUser && AuthUser?.Auth0User?.sub === User?.Auth0User?.sub,
                isRepresentingYou: (await mongoDB.collection("UserRepresentations")
                    .find({
                        "representativeId": new ObjectId(User._id),
                        "representeeId": new ObjectId(AuthUser?._id),
                        "isRepresentingYou": true
                    }).count()) || 0,
                stats: await getUserStats({ userId: User._id, mongoDB }),
                ...!!AuthUser && (AuthUser._id.toString() !== User._id.toString()) && {
                    yourStats: await getYourUserStats({ userId: User._id, AuthUser, mongoDB }),
                }
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

            console.log({
                User,
                group
            })

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
            { handle, groupHandle, representativeHandle },
            { mongoDB, AuthUser }
        ) => {
            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const RepresentativeUser = !!representativeHandle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': representativeHandle });

            const group = !!groupHandle && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const representativesAndGroups = (
                await mongoDB.collection("UserRepresentations").aggregate(
                    [
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
                        }
                    ]
                ).toArray())
                .map(r => ({
                    ...r?.representativeUser[0]?.LiquidUser,
                    representationGroups: r?.groups
                }));

            return representativesAndGroups;
        },

        UserGroups: async (_source, { handle, representative, notUsers }, { mongoDB, AuthUser }) => {

            console.log({ handle, representative, notUsers, c: !(!!handle) });

            const User = !!handle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const UserGroupMemberRelations = !!User && await mongoDB.collection("GroupMembers")
                .find({ 'userId': new ObjectId(User?._id), 'isMember': true })
                .toArray();

            // console.log({
            //     User,
            //     UserGroupMemberRelations
            // });

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

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': representative });

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

            const Groups = await Promise.all((await mongoDB.collection("Groups").find({
                ...!!UserGroupMemberRelations && {
                    "_id": {
                        [`${notUsers ? '$nin' : '$in'}`]: UserGroupMemberRelations.map(r => new ObjectId(r.groupId))
                    },
                },
                ...(notUsers || !(!!handle)) && {
                    privacy: 'public'
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
                                        representeeId: new ObjectId(User?._id),
                                        groupId: new ObjectId(g?._id),
                                    })
                            }
                        }))(RepresentativeGroupMemberRelations && RepresentativeGroupMemberRelations.find(
                            r => r.groupId.toString() === g._id.toString()
                        ))
                    }
                })));

            return Groups;
        },
        UserQuestions: async (_source, {
            handle,
            sortBy,
            notUsers
        }, { mongoDB, AuthUser }) => {

            const User = !!handle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const UserGroupMemberRelations = !!User && await mongoDB.collection("GroupMembers")
                .find({ 'userId': new ObjectId(User?._id) })
                .toArray();

            const UserGroups = !!UserGroupMemberRelations && await mongoDB.collection("Groups").find({
                "_id": {
                    "$in": UserGroupMemberRelations.map(r => new ObjectId(r.groupId))
                }
            })
                .toArray();

            const Questions = await mongoDB.collection("Questions")
                .aggregate(
                    [
                        ...(!!UserGroups && !notUsers) ? [{
                            '$match': {
                                'groupChannel.group': { '$in': UserGroups.map(g => g.handle) }
                            }
                        }] : [],
                        ...(!!UserGroups && notUsers) ? [{
                            '$match': {
                                'groupChannel.group': { '$nin': UserGroups.map(g => g.handle) }
                            }
                        }] : [],
                        {
                            '$addFields': {
                                'stats.lastEditOrVote': {
                                    '$cond': [
                                        {
                                            '$gt': [
                                                '$lastEditOn', '$stats.lastVoteOn'
                                            ]
                                        }, '$lastEditOn', '$stats.lastVoteOn'
                                    ]
                                },
                                'stats.totalVotes': {
                                    '$sum': [
                                        '$stats.directVotes', '$stats.indirectVotes'
                                    ]
                                },
                                // 'thisUserIsAdmin': {
                                //     '$eq': ['$createdBy', AuthUser?.LiquidUser?.handle]
                                // }
                            }
                        },
                        ...(sortBy === 'weight') ? [
                            {
                                '$sort': { 'stats.totalVotes': -1 }
                            }
                        ] : [],
                        ...(sortBy === 'time') ? [
                            {
                                '$sort': { 'stats.lastEditOrVote': -1 }
                            }
                        ] : []
                    ]
                )
                .toArray();

            // TODO: move this logic to the aggregation, it'll run much faster
            return await Promise.all(Questions.map(async (q) => ({
                ...q,
                // thisUserIsAdmin: q.createdBy === AuthUser?.LiquidUser?.handle,
                ...(q.questionType === 'single' && !!AuthUser) && {
                    yourVote: await mongoDB.collection("Votes").findOne({
                        questionText: q.questionText,
                        'groupChannel.group': q.groupChannel.group,
                        user: AuthUser?._id
                    })
                },
                ...(q.questionType === 'multi' && !!AuthUser) && {
                    choices: await Promise.all(q.choices.map(async (c) => ({
                        ...c,
                        yourVote: await mongoDB.collection("Votes").findOne({
                            questionText: q.questionText,
                            'groupChannel.group': q.groupChannel.group,
                            choiceText: c.text,
                            user: AuthUser?._id
                        })
                    })))
                }
            })));
        }
    },
    Mutation: {
        editUser: async (_source, { User }, { mongoDB, AuthUser }) => {

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
            InviteId
        }, { mongoDB, AuthUser }) => {

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

            const isUser = AuthUser?.LiquidUser?.handle === RepresenteeHandle;

            const Representee = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresenteeHandle });

            const Representative = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': RepresentativeHandle });

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': Group });

            const RepresentativeGroupRelation = await mongoDB.collection("UserRepresentations")
                .findOne({
                    representativeId: new ObjectId(Representative?._id),
                    representeeId: new ObjectId(Representee?._id),
                    groupId: new ObjectId(Group_?._id),
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
                    { returnDocument: 'after' }
                )
            )?.value : isUser ? (
                await mongoDB.collection("UserRepresentations").insertOne({
                    representativeId: new ObjectId(Representative?._id),
                    representeeId: new ObjectId(Representee?._id),
                    groupId: new ObjectId(Group_?._id),
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
                        "representeeId": new ObjectId(userId),
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
        representedBy: (
            await mongoDB.collection("UserRepresentations").aggregate(
                [{
                    $match: {
                        "representativeId": new ObjectId(userId),
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
        groupsJoined: await mongoDB.collection("GroupMembers")
            .find({
                "userId": new ObjectId(userId),
                "isMember": true
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "isDirect": true,
                'position': { $ne: null },
                "user": new ObjectId(userId)
            }).count(),
        indirectVotesMadeByUser: await mongoDB.collection("Votes")
            .find({
                "isDirect": false,
                'position': { $ne: null },
                "representatives.representativeId": new ObjectId(userId)
            }).count(),
        indirectVotesMadeForUser: await mongoDB.collection("Votes")
            .find({
                "isDirect": false,
                'position': { $ne: null },
                "user": new ObjectId(userId)
            }).count(),
    });
}

const getYourUserStats = async ({ userId, AuthUser, mongoDB }) => {

    const votesInCommon = (
        await mongoDB.collection("Votes")
            .aggregate([
                {
                    '$match': {
                        'user': new ObjectId(AuthUser._id),
                        'position': { $ne: null }
                    }
                }, {
                    '$lookup': {
                        'from': 'Votes',
                        'let': {
                            'userId': userId,
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
                        ],
                        'as': 'userVote'
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
            ])
            .toArray()
    )?.[0];

    return {
        votesInCommon: votesInCommon?.votesInCommon || 0, // count
        directVotesInCommon: votesInCommon?.directVotesInCommon || 0, // count it both direct

        directVotesInAgreement: votesInCommon?.directVotesInAgreement || 0, // count if positions are the same & both direct
        directVotesInDisagreement: votesInCommon?.directVotesInDisagreement || 0, // count if positions differ & both direct

        indirectVotesMadeByYou: votesInCommon?.indirectVotesMadeByYou || 0, // count if user made indirect vote and you represented him
        indirectVotesMadeForYou: votesInCommon?.indirectVotesMadeForYou || 0, // count if you made an indirect vote and he represented you
    }
}