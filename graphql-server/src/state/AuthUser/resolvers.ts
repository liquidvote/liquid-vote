

export const AuthUserResolvers = {
    Query: {
        authUser: async (_source, { }, { mongoDB, AuthUser }) => {

            return AuthUser;
        },
    },
    Mutation: {
        authUserLoggedIn: async (_source, { Auth0User }, { mongoDB }) => {

            const AuthUser = await mongoDB.collection("Users")
                .findOne({ 'Auth0User.sub': Auth0User.sub });

            if (!AuthUser) {

                const getUniqueUserHandle = async (handle, count) => {

                    const newHandle = `${handle}${count !== 0 ? count : ''}`;

                    const existingUser = (
                        await mongoDB.collection("Users").findOne({
                            'LiquidUser.handle': newHandle
                        })
                    );

                    if (!!existingUser) {
                        console.log(`${handle} already used`);
                        return getUniqueUserHandle(handle, count + 1);
                    } else {
                        return newHandle;
                    }
                };

                // TODO: send user avatar to S3
                // TODO: make sure handle is unique

                const created = await mongoDB.collection("Users").insertOne({
                    Auth0User,
                    LiquidUser: {
                        email: Auth0User.email,
                        name: Auth0User.nickname,
                        handle: getUniqueUserHandle(Auth0User.nickname,0), // TODO: Force Unique
                        avatar: Auth0User.picture || 'http://images.liquid-vote.com/system/placeholderCover1.jpeg',
                        cover: 'http://images.liquid-vote.com/system/placeholderCover1.jpeg',
                        bio: '🌱',
                        location: '🌍 earth',
                        externalLink: null,
                        joinedOn: Date.now(),
                        lastEditOn: Date.now(),
                        representing: 0,
                        representedBy: 0,
                        groups: 0,
                        directVotes: 0,
                    }
                });
            }

            return AuthUser;
        }
    },
};