

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

                const created = await mongoDB.collection("Users").insertOne({
                    Auth0User,
                    LiquidUser: {
                        email: Auth0User.email,
                        name: Auth0User.nickname,
                        handle: Auth0User.nickname, // TODO: Force Unique
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