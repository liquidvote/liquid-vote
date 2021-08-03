import { ObjectID } from 'mongodb';

export const GroupResolvers = {
    Query: {
        Group: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const GroupMemberRelation = AuthUser ? (await mongoDB.collection("GroupMembers")
                .findOne({
                    'userId': ObjectID(AuthUser._id),
                    'groupId': ObjectID(Group._id)
                })) : {};

            return {
                ...Group,
                thisUserIsAdmin: !!Group.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                // channels: Group.channels.map((g) => ({
                //     ...g,
                //     // thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                // }))
                yourMemberRelation: GroupMemberRelation,
                stats: await getGroupStats({
                    groupHandle: Group.handle,
                    groupId: Group._id,
                    mongoDB
                }),
                yourStats: !!AuthUser && await getYourGroupStats({
                    groupHandle: Group.handle,
                    groupId: Group._id,
                    AuthUser,
                    mongoDB,
                }),
            };
        },
        GroupMembers: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const GroupMemberRelations = (
                await mongoDB.collection("GroupMembers")
                    .find({
                        'groupId': ObjectID(Group._id),
                        'isMember': true
                    }).toArray()
            );

            const Members = (
                await mongoDB.collection("Users").find({
                    "_id": {
                        "$in": GroupMemberRelations.map(r => ObjectID(r.userId))
                    }
                }).toArray()
            )?.map(u => u?.LiquidUser);

            return Members;
        },
        GroupQuestions: async (_source, { handle, channels }, { mongoDB, s3, AuthUser }) => {

            const Questions = await mongoDB.collection("Questions")
                .find({ 'groupChannel.group': handle })
                .toArray();

            return Questions.map(q => ({
                ...q,
                thisUserIsAdmin: q.createdBy === AuthUser?.LiquidUser?.handle,
            }));
        },
        Groups: async (_source, { userHandle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': userHandle });

            const GroupsMemberRelations = await mongoDB.collection("GroupMembers")
                .find({ 'userId': ObjectID(User?._id) })
                .toArray();

            const Groups = await Promise.all((
                await mongoDB.collection("Groups").find({
                    "_id": {
                        "$in": GroupsMemberRelations.map(r => ObjectID(r.groupId))
                    }
                }).toArray()
            )
                .map(async (g) => ({
                    ...g,
                    thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                    stats: await getGroupStats({
                        groupHandle: g.handle,
                        groupId: g._id,
                        mongoDB
                    }),
                })));

            return Groups;
        },
    },
    Mutation: {
        editGroup: async (_source, { Group, handle }, { mongoDB, s3, AuthUser }) => {

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const savedGroup = (AuthUser && handle === 'new') ?
                (await mongoDB.collection("Groups").insertOne({
                    'handle': Group.handle,
                    'name': Group.name,
                    'bio': Group.bio,
                    'externalLink': Group.externalLink,
                    'avatar': Group.avatar,
                    'cover': Group.cover,
                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'admins': Group.admins,
                    'privacy': Group.privacy,
                    'channels': [{
                        name: 'general',
                    }]
                }))?.ops[0] : (
                    AuthUser &&
                    Group_.admins.find(u => u.handle === AuthUser.LiquidUser.handle)
                ) ? (await mongoDB.collection("Groups").findOneAndUpdate(
                    { _id: Group_._id },
                    {
                        $set: {
                            'name': Group.name,
                            'bio': Group.bio,
                            'externalLink': Group.externalLink,
                            'avatar': Group.avatar,
                            'cover': Group.cover,
                            'lastEditOn': Date.now(),
                            'admins': Group.admins,
                            'privacy': Group.privacy,
                            'channels': Group.channels.map(c => ({
                                name: c.name
                            }))
                        },
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                ))?.value : null;

            if (AuthUser && handle === 'new') {

                // const GroupMemberRelation = await mongoDB.collection("GroupMembers")
                //     .find({
                //         'userId': ObjectID(AuthUser._id),
                //         'groupId': ObjectID(Group_._id)
                //     })
                //     .toArray();

                const GroupsMemberRelation = (await mongoDB
                    .collection("GroupMembers")
                    .insertOne({
                        groupId: savedGroup._id,
                        userId: AuthUser._id,
                        joinedOn: Date.now(),
                        lastEditOn: Date.now(),
                        isMember: true,
                        channels: ['general']
                    }))?.ops[0];
            }

            return {
                ...savedGroup,
                thisUserIsAdmin: true
            };
        }
    },
};

export const getGroupStats = async ({ groupId, groupHandle, mongoDB }) => {

    const mostRepresentingMembers = (await mongoDB.collection("GroupMembers")
        .aggregate([
            {
                '$match': {
                    'groupId': groupId,
                    'isMember': true
                }
            },
            {
                '$lookup': {
                    'from': 'Votes',
                    'let': {
                        'representativeId': '$userId'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                'groupChannel.group': groupHandle
                            }
                        }, {
                            '$unwind': '$representatives'
                        }, {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$representatives.representativeId', '$$representativeId'
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'representees'
                }
            }, {
                '$project': {
                    'user': '$userId',
                    'representeeCount': {
                        '$size': {
                            '$ifNull': [
                                '$representees', []
                            ]
                        }
                    }
                }
            }, {
                '$sort': {
                    'representeeCount': -1
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$first': '$user.LiquidUser'
                    }
                }
            }, {
                '$limit' : 6
            }
        ])
        .toArray()
    )?.slice(0, 6);

    return ({
        lastDirectVoteOn: 0,
        members: await mongoDB.collection("GroupMembers")
            .find({
                "groupId": ObjectID(groupId),
                "isMember": true
            }).count(),
        questions: await mongoDB.collection("Questions")
            .find({
                "groupChannel.group": groupHandle,
            }).count(),
        representations: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": ObjectID(groupId),
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": true
            }).count(),
        indirectVotesMade: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": false
            }).count(),
        mostRepresentingMembers
    });
}

const getYourGroupStats = async ({ groupId, groupHandle, AuthUser, mongoDB }) => {

    return ({
        lastDirectVoteOn: 0,
        representing: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": ObjectID(groupId),
                "representeeId": ObjectID(AuthUser._id),
            }).count(),
        representedBy: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": ObjectID(groupId),
                "representativeId": ObjectID(AuthUser._id),
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": true,
                "user": AuthUser.LiquidUser.handle
            }).count(),
        indirectVotesMadeByYou: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": false,
                "representatives.representativeId": ObjectID(AuthUser._id)
            }).count(),
        indirectVotesMadeForYou: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": false,
                "user": AuthUser.LiquidUser.handle
            }).count()
    });
}