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

            // console.log({
            //     GroupMemberRelation,
            //     AuthUser,
            //     Group
            // });

            return {
                ...Group,
                thisUserIsAdmin: !!Group.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                // channels: Group.channels.map((g) => ({
                //     ...g,
                //     // thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                // }))
                memberRelation: GroupMemberRelation
            };
        },
        GroupMembers: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            return [];
        },
        GroupQuestions: async (_source, { handle, channels }, { mongoDB, s3, AuthUser }) => {

            console.log('GroupQuestions');

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

            const Groups = (
                await mongoDB.collection("Groups").find({
                    "_id": {
                        "$in": GroupsMemberRelations.map(r => ObjectID(r.groupId))
                    }
                }).toArray()
            )
                .map((g) => ({
                    ...g,
                    thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle),
                    // memberRelation: GroupMemberRelation
                }));

            return Groups;
        },
    },
    Mutation: {
        editGroup: async (_source, { Group, handle }, { mongoDB, s3, AuthUser }) => {

            // console.log({
            //     Group,
            //     handle
            // })

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
                        // purpose: 'An automatically generated channel',
                        // createdOn: Date.now(),
                        // lastEditOn: Date.now(),
                        // members: 1,
                        // questions: 0
                    }],
                    members: 1
                }))?.ops[0] : (
                    AuthUser &&
                    Group_.admins.find(u => u.handle === AuthUser.LiquidUser.handle)
                ) ? await mongoDB.collection("Groups").updateOne(
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
                            // 'channels': Group.channels,
                        },
                    }
                ) : null;

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
                        channels: [{
                            channelName: 'general',
                            joinedOn: Date.now(),
                            lastEditOn: Date.now(),
                            isMember: true,
                        }]
                    }))?.ops[0];
            }

            return {
                ...savedGroup,
                thisUserIsAdmin: true
            };
        },
        editGroupChannel: async (_source, { Channel, handle }, { mongoDB, s3, AuthUser }) => {

            // console.log({
            //     Channel,
            //     handle
            // })

            const Group_ = await mongoDB.collection("Groups")
                .findOne({ 'handle': handle });

            const isChannelNew = !Group_.channels.find(c => c.name === Channel.name);

            // const savedGroup = (
            //         AuthUser &&
            //         Group_.admins.find(u => u.handle === AuthUser.LiquidUser.handle)
            //     ) ? await mongoDB.collection("Groups").updateOne(
            //         { _id: Group_._id },
            //         {
            //             $set: {
            //                 channels: Group_.channels
            //             },
            //         }
            //     ) : null;

            if (
                Group_.admins.find(u => u.handle === AuthUser.LiquidUser.handle)
                && isChannelNew
            ) {
                // const GroupsMemberRelation = await mongoDB
                //     .collection("GroupMembers")
                //     .insertOne({
                //         groupId: savedGroup._id,
                //         userId: AuthUser._id,
                //         createdOn: Date.now(),
                //         lastEditOn: Date.now(),
                //     })?.ops[0];

                // await mongoDB.collection("Groups").updateOne(
                //     { _id: Group_._id },
                //     {
                //         $set: {
                //             'name': Group.name,
                //             'bio': Group.bio,
                //             'externalLink': Group.externalLink,
                //             'avatar': Group.avatar,
                //             'cover': Group.cover,
                //             'lastEditOn': Date.now(),
                //             'admins': Group.admins,
                //             'privacy': Group.privacy,
                //         },
                //     }
                // )

            }

            return {
                // ...savedGroup,
                // thisUserIsAdmin: true
            };
        },
    },
};