import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from '../Users/aggregationLogic/votesInCommonPipelineForVotes';
import { yourGroupStats, groupStats } from './aggregationLogic';

export const GroupResolvers = {
    Query: {
        Group: async (_source, { handle }, { mongoDB, AuthUser }) => {

            const Group = (await mongoDB.collection("Groups").aggregate([
                { '$match': { 'handle': handle } },

                {
                    '$replaceRoot': {
                        newRoot: {
                            group: "$$ROOT"
                        }
                    }
                },

                ...groupStats(),
                ...yourGroupStats(AuthUser),
            ]).toArray())?.[0];

            if (!Group) return;

            const GroupMemberRelation = AuthUser ? (
                await mongoDB.collection("GroupMembers")
                    .findOne({
                        'userId': new ObjectId(AuthUser._id),
                        'groupId': new ObjectId(Group._id)
                    })) : {};

            return {
                ...Group.group,
                thisUserIsAdmin: !!Group.group.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                yourMemberRelation: GroupMemberRelation,
                //TODO: replace with Aggregation
                stats: Group.groupStats,

                yourStats: !!AuthUser && {
                    ...Group.yourGroupStats,
                },
            };
        },
        Groups: async (_source, { }, { mongoDB, AuthUser }) => {
            if (!AuthUser || AuthUser?.LiquidUser?.admin !== 'total') return;

            console.log('here');

            const Groups = await Promise.all((
                await mongoDB.collection("Groups").find().toArray()
            ));

            console.log({ Groups });

            return Groups;
        },
        GroupMembers: async (_source, { handle }, { mongoDB, AuthUser }) => {

            const group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const Members = await mongoDB.collection("GroupMembers")
                .aggregate([
                    {
                        '$match': {
                            'groupId': new ObjectId(group._id),
                            'isMember': true
                        },
                    }, {
                        '$lookup': {
                            'from': 'Users',
                            'localField': 'userId',
                            'foreignField': '_id',
                            'as': 'member'
                        }
                    }, {
                        '$addFields': {
                            'member': { '$first': '$member.LiquidUser' }
                        }
                    }, {
                        '$replaceRoot': {
                            newRoot: {
                                $mergeObjects: [
                                    { userId: "$userId" },
                                    "$member"
                                ]
                            }
                        }
                    },
                    {
                        '$lookup': {
                            'as': 'directVotesMade',
                            'from': 'Votes',
                            'let': {
                                'userId': '$userId',
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
                                                        '$groupChannel.group', group.handle
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
                            'stats': {
                                'directVotesMade': {
                                    $size: '$directVotesMade'
                                }
                            }
                        }
                    },
                    ...(!!AuthUser?._id) ? [{
                        '$lookup': {
                            'as': 'yourStats',
                            'from': 'Votes',
                            'let': {
                                'userId': '$userId',
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
                                                        '$groupChannel.group', group.handle
                                                    ]
                                                }
                                            },
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
                        $sort: { 'stats.directVotesMade': -1 }
                    }] : [],
                ])?.toArray();

            return Members.map(m => ({
                ...m,
                email: null
            }));
        },
        GroupQuestions: async (_source, { handle, channels }, { mongoDB, AuthUser }) => {

            const Questions = await mongoDB.collection("Questions")
                .find({ 'groupChannel.group': handle })
                .toArray();

            return Questions.map(q => ({
                ...q,
                thisUserIsAdmin: q.createdBy === AuthUser?._id,
            }));
        },
    },
    Mutation: {
        editGroup: async (_source, { Group, handle }, { mongoDB, AuthUser }) => {

            if (!AuthUser) return;

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            if (!!Group_ && !Group_.admins.find(u => u.handle === AuthUser.LiquidUser.handle)) return;

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
                    { returnDocument: 'after' }
                ))?.value : null;

            const adminsIds = (await Promise.all(
                await mongoDB.collection("Users").find({
                    "LiquidUser.handle": {
                        "$in": savedGroup?.admins?.map(u => u.handle)
                    }
                }).toArray()
            ))?.map((u: any) => u._id);

            const MakeAdminsMembers = await Promise.all(adminsIds
                .map(async (admin) => {
                    const adminMemberRelation = (await mongoDB.collection("GroupMembers")
                        .findOneAndUpdate({
                            groupId: new ObjectId(savedGroup._id),
                            userId: new ObjectId(admin),
                        }, {
                            $set: {},
                            $setOnInsert: {
                                groupId: new ObjectId(savedGroup._id),
                                userId: new ObjectId(admin),
                                joinedOn: Date.now(),
                                lastEditOn: Date.now(),
                                isMember: true,
                            }
                        },
                            {
                                upsert: true,
                                returnDocument: 'after'
                            }
                        ))?.value;
                })
            );

            return {
                ...savedGroup,
                thisUserIsAdmin: true
            };
        },
        // updateGroupRepresentatives
        adminApproveGroup: async (_source, { handle, newStatus }, { mongoDB, AuthUser }) => {

            if (!AuthUser || AuthUser?.LiquidUser?.admin !== 'total') return;

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const updated = (AuthUser && Group) ? (
                await mongoDB.collection("Groups").findOneAndUpdate(
                    { _id: Group._id },
                    {
                        $set: {
                            'adminApproved': newStatus,
                            'lastAdminEditOn': Date.now(),
                        },
                    },
                    { returnDocument: 'after' }
                )
            )?.value : null;

            return updated;
        },
    },
};