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
                }
            };
        },

        UserRepresenting: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return [];
        },

        UserRepresented: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return [];
        },

        UserDirectVotes: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return [];
        },

        UserGroups: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            const GroupsMemberRelations = await mongoDB.collection("GroupMembers")
                .find({ 'userId': ObjectID(User?._id) })
                .toArray();

            const Groups = (await mongoDB.collection("Groups").find({
                "_id": {
                    "$in": GroupsMemberRelations.map(r => ObjectID(r.groupId))
                }
            })
                .toArray())
                .map((g) => ({
                    ...g,
                    thisUserIsAdmin: !!g.admins.find(u => u.handle === AuthUser?.LiquidUser?.handle)
                }));

            return Groups;
        },
    },
    Mutation: {
        editUser: async (_source, { User }, { mongoDB, s3, AuthUser }) => {

            const updated = (AuthUser && User) ? await mongoDB.collection("Users").updateOne(
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
                }
            ) : null;

            return updated;
        },
        editGroupMemberChannelRelation: async (_source, { UserHandle, GroupHandle, Channels }, { mongoDB, s3, AuthUser }) => {

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': GroupHandle });

            const GroupsMemberRelation = await mongoDB.collection("GroupMembers")
                .find({
                    'userId': ObjectID(AuthUser._id),
                    'groupId': ObjectID(Group._id)
                })
                .toArray();

            console.log({
                UserHandle,
                GroupHandle,
                GroupsMemberRelation,
                Channels
            })

            // const updated = (AuthUser && User) ? await mongoDB.collection("Users").updateOne(
            //     { _id: AuthUser._id },
            //     {
            //         $set: {
            //             'LiquidUser.name': User.name,
            //             'LiquidUser.location': User.location,
            //             'LiquidUser.bio': User.bio,
            //             'LiquidUser.externalLink': User.externalLink,
            //             'LiquidUser.avatar': User.avatar,
            //             'LiquidUser.cover': User.cover,
            //             'LiquidUser.email': User.email,
            //             'LiquidUser.lastEditOn': Date.now(),
            //         },
            //     }
            // ) : null;

            return null;
        },
    },
};