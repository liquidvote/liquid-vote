import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from '../Users/aggregationLogic';

export const GroupResolvers = {
    Query: {
        Group: async (_source, { handle }, { mongoDB, AuthUser }) => {

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            if (!Group) return;

            const GroupMemberRelation = AuthUser ? (await mongoDB.collection("GroupMembers")
                .findOne({
                    'userId': new ObjectId(AuthUser._id),
                    'groupId': new ObjectId(Group._id)
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
                    // directVotesMade: await mongoDB.collection("Votes")
                    // .find({
                    //     "isDirect": true,
                    //     'position': { $ne: null },
                    //     "user": new ObjectId(userId)
                    // }).count(),
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
                                ...votesInCommonPipelineForVotes({
                                    groupHandle: group.handle,
                                    authUserId: AuthUser._id
                                })
                            ]
                        }
                    }, {
                        '$addFields': {
                            'yourStats': { '$first': '$yourStats' }
                        }
                    }, {
                        $sort: { 'yourStats.directVotesInCommon': -1 }
                    }] : [],
                ])?.toArray();

            // TODO: sort by Agreeability
            // TODO: sort by % votes in common

            return Members;
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
        Groups: async (_source, { userHandle }, { mongoDB, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': userHandle });

            const GroupsMemberRelations = await mongoDB.collection("GroupMembers")
                .find({ 'userId': new ObjectId(User?._id) })
                .toArray();

            const Groups = await Promise.all((
                await mongoDB.collection("Groups").find({
                    "_id": {
                        "$in": GroupsMemberRelations.map(r => new ObjectId(r.groupId))
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
                '$limit': 6
            }
        ])
        .toArray()
    )?.slice(0, 6);

    return ({
        lastDirectVoteOn: 0,
        members: await mongoDB.collection("GroupMembers")
            .find({
                "groupId": new ObjectId(groupId),
                "isMember": true
            }).count(),
        questions: await mongoDB.collection("Questions")
            .find({
                "groupChannel.group": groupHandle,
                "status": { "$ne": "deleted" }
            }).count(),
        representations: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": new ObjectId(groupId),
                "isRepresentingYou": true
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": true,
                'position': { $ne: null },
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

    const votesInCommon = (
        await mongoDB.collection("Votes")
            .aggregate([
                {
                    '$match': {
                        'groupChannel.group': groupHandle,
                        'position': { $ne: null }
                    }
                }, {
                    '$lookup': {
                        'from': 'Votes',
                        'let': {
                            'userId': new ObjectId(AuthUser._id),
                            'questionText': '$questionText',
                            'choiceText': '$choiceText',
                            'group': '$groupChannel.group'
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
                                        },
                                        {
                                            '$expr': {
                                                '$eq': [
                                                    '$groupChannel.group', '$$group'
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
                        'byYou': {
                            '$eq': ['$user', new ObjectId(AuthUser?._id)]
                        },
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
                            $cond: {
                                if: { $eq: ["$isDirect", true] },
                                then: false,
                                else: {
                                    '$gte': [
                                        {
                                            '$size': {
                                                '$filter': {
                                                    'input': '$representatives',
                                                    'as': 'r',
                                                    'cond': {
                                                        '$eq': [
                                                            '$$r.representativeId', new ObjectId(AuthUser?._id)
                                                        ]
                                                    }
                                                }
                                            }
                                        }, 1
                                    ]
                                }
                            }
                        },
                        'otherVoteMadeForYou': {
                            $cond: {
                                if: {
                                    '$or': [
                                        { $not: ["$otherVote"] },
                                        { $eq: ["$otherVote.isDirect", true] }
                                    ]
                                },
                                then: false,
                                else: {
                                    '$gte': [
                                        {
                                            '$size': {
                                                '$filter': {
                                                    'input': '$otherVote.representatives',
                                                    'as': 'r',
                                                    'cond': {
                                                        '$and': [
                                                            {
                                                                '$eq': [
                                                                    '$$r.representativeId', '$user'
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }, 1
                                    ]
                                }
                            }
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
                                        '$and': [
                                            {
                                                '$eq': [
                                                    '$bothDirect', true
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$byYou', false
                                                ]
                                            }
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
                                            }, {
                                                '$eq': [
                                                    '$byYou', false
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
                                            }, {
                                                '$eq': [
                                                    '$byYou', false
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

    // console.log({
    //     votesInCommon
    // });

    return ({
        lastDirectVoteOn: 0,
        representing: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": new ObjectId(groupId),
                "representeeId": new ObjectId(AuthUser._id),
                isRepresentingYou: true
            }).count(),
        representedBy: await mongoDB.collection("UserRepresentations")
            .find({
                "groupId": new ObjectId(groupId),
                "representativeId": new ObjectId(AuthUser._id),
                isRepresentingYou: true
            }).count(),
        directVotesMade: await mongoDB.collection("Votes")
            .find({
                "groupChannel.group": groupHandle,
                "isDirect": true,
                'position': { $ne: null },
                "user": new ObjectId(AuthUser._id)
            }).count(),

        votesInCommon: votesInCommon?.votesInCommon || 0, // count
        directVotesInCommon: votesInCommon?.directVotesInCommon || 0, // count it both direct

        directVotesInAgreement: votesInCommon?.directVotesInAgreement || 0, // count if positions differ & both direct
        directVotesInDisagreement: votesInCommon?.directVotesInDisagreement || 0, // count if positions differ & both direct

        indirectVotesMadeByYou: votesInCommon?.indirectVotesMadeByYou || 0, // count if user made indirect vote and you represented him
        indirectVotesMadeForYou: votesInCommon?.indirectVotesMadeForYou || 0, // count if you made an indirect vote and he represented you
    });
}