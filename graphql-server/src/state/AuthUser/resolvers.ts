const authUser = {
    name: "name placeholder",
    avatarUrl: "avatarUrl placeholder",
};

export const AuthUserResolvers = {
    Query: {
        authUser: () => authUser,
    },
    Mutation: {
        authUserLoggedIn: async (_source, { Auth0User }, { mongoDB, s3 }) => {

            const AuthUser = await mongoDB.collection("Users")
                .findOne({ 'Auth0User.sub': Auth0User.sub });

            if (!AuthUser) {
                const created = await mongoDB.collection("Users").insertOne({
                    Auth0User
                });
            }

            return AuthUser;
        }
    },
};