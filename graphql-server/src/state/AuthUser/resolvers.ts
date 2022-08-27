import { ObjectId } from 'mongodb';

export const AuthUserResolvers = {
    Query: {
        authUser: async (_source, { }, { mongoDB, AuthUser }) => {

            const unseenNotificationCount = await mongoDB.collection("Notifications").find({
                'toUser': new ObjectId(AuthUser?._id),
                'seen': false,
            }).count();

            console.log({
                unseenNotificationCount
            })

            return AuthUser && {
                ...AuthUser,
                unseenNotificationCount
            };
        },
    },
    Mutation: {
        authUserLoggedIn: async (_source, { Auth0User, firebase_token }, { mongoDB, AuthUser }) => {

            console.log({ firebase_token });

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
                    console.log(`${handle} new`);
                    return newHandle;
                }
            };

            const dbDoc = (await mongoDB.collection("Users")
                .findOneAndUpdate({
                    'Auth0User.sub': AuthUser?.Auth0User?.sub || Auth0User.sub
                }, {
                    $set: {
                        ...firebase_token ? { 'NotificationSettings.firebase_token': firebase_token } : {},
                        // 'LiquidUser.lastLogin': Date.now(),
                    },
                    $setOnInsert: {
                        Auth0User,
                        LiquidUser: {
                            email: Auth0User.email,
                            name: Auth0User.nickname,
                            handle: await getUniqueUserHandle(Auth0User.nickname, 0),
                            avatar: Auth0User.picture || 'http://images.liquid-vote.com/system/placeholderCover1.jpeg',
                            cover: 'http://images.liquid-vote.com/system/placeholderCover1.jpeg',
                            bio: '🌱',
                            location: '🌍 earth',
                            externalLink: null,
                            joinedOn: Date.now(),
                            lastEditOn: Date.now(),
                        }
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            return dbDoc;
        },
        editNotificationSettings: async (_source, { notificationSettings }, { mongoDB, AuthUser }) => {

            if (!AuthUser && !notificationSettings) return;

            const dbDoc = (await mongoDB.collection("Users")
                .findOneAndUpdate({
                    'Auth0User.sub': AuthUser?.Auth0User?.sub
                }, {
                    $set: {
                        'NotificationSettings.allowEmails': notificationSettings?.allowEmails,
                        'NotificationSettings.allowNotifications': notificationSettings?.allowNotifications,
                    },
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            console.log({ dbDoc });

            return dbDoc?.NotificationSettings;
        }
    },
};