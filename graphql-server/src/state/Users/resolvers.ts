import { ObjectID } from 'mongodb';

export const UserResolvers = {
    Query: {
        User: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return {
                ...User?.LiquidUser,
                isThisUser: !!AuthUser && AuthUser?.Auth0User?.sub === User?.Auth0User?.sub,
                ...(!!AuthUser && AuthUser?.Auth0User?.sub !== User?.Auth0User?.sub) && {
                    sameDirectVotes: 0,
                    differentDirectVotes: 0,
                },
                isRepresentingYou: (await mongoDB.collection("UserRepresentations")
                    .find({
                        "representativeId": ObjectID(User._id),
                        "representeeId": ObjectID(AuthUser?._id),
                        "isRepresentingYou": true
                    }).count()) || 0,
                stats: await getUserStats({ userId: User._id, mongoDB })
            };
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

        UserDirectVotes: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return [];
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

            // console.log('edit relation!', {
            //     UserHandle,
            //     GroupHandle,
            //     Channels,
            //     IsMember,
            //     isUser: AuthUser?.LiquidUser?.handle === UserHandle
            // });

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': GroupHandle });

            const GroupsMemberRelation = await mongoDB.collection("GroupMembers")
                .findOne({
                    'userId': ObjectID(AuthUser._id),
                    'groupId': ObjectID(Group._id)
                });

            // console.log({
            //     isUser,
            //     GroupsMemberRelation:  GroupsMemberRelation._id,
            //     doIsMember: typeof IsMember !== 'undefined',
            //     IsMember,
            //     doChannels: typeof Channels !== 'undefined',
            //     Channels
            // })

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

            // console.log({
            //     RepresenteeHandle,
            //     RepresentativeHandle,
            //     Group,
            //     IsRepresentingYou,

            //     Representee: Representee._id,
            //     Representative: Representative._id,
            //     Group_: Group_._id
            // })

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
        directVotesMade: 0, // TODO
        indirectVotesMadeByUser: 0, // TODO
        indirectVotesMadeForUser: 0, // TODO
    });
}