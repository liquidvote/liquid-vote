export const UserResolvers = {
    Query: {
        User: async (_source, { handle }, { mongoDB, s3, AuthUser }) => {

            const User = await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': handle });

            return {
                ...User?.LiquidUser,
                isThisUser: !!AuthUser && AuthUser?.Auth0User?.sub === User?.Auth0User?.sub
            };
        },
    },
    Mutation: {
        editUser: async (_source, { User }, { mongoDB, s3, AuthUser }) => {

            console.log({ authUser: AuthUser, editUser: User });

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

            //     const created = await mongoDB.collection("Users").insertOne({
            //         Auth0User,
            //         LiquidUser: {
            //             email: Auth0User.email,
            //             name: Auth0User.name,
            //             handle: Auth0User.nickname, // TODO: Force Unique
            //             avatar: Auth0User.picture,
            //             cover: null,
            //             bio: null,
            //             location: null,
            //             externalLink: null,
            //             joinedOn: Date.now(),
            //             lastEditOn: Date.now(),
            //             representing: 0,
            //             representedBy: 0,
            //             groups: 0,
            //             directVotes: 0,
            //         }
            //     });
            // }

            return updated;
        }
    },
};