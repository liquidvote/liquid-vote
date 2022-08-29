import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { sendEmail } from './sendEmail';
import { sendPushNotification } from './sendPushNotification';

export const NotificationResolvers = {
    Query: {
        YourNotifications: async (_source, { }, { mongoDB, AuthUser }) => {

            const YourNotificationsAgg = [
                {
                    '$match': {
                        'toUser': new ObjectId(AuthUser?._id),
                    },
                },
                {
                    '$lookup': {
                        'from': 'Groups',
                        'localField': 'group',
                        'foreignField': '_id',
                        'as': 'group'
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'actionUser',
                        'foreignField': '_id',
                        'as': 'actionUser'
                    }
                }, {
                    '$lookup': {
                        'from': 'Questions',
                        'localField': 'question',
                        'foreignField': '_id',
                        'as': 'question'
                    }
                },{
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'user',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$addFields': {
                        'actionUser': {
                            '$first': '$actionUser.LiquidUser'
                        },
                        'group': {
                            '$first': '$group'
                        },
                        'question': {
                            '$first': '$question'
                        },
                        'user': {
                            '$first': '$user.LiquidUser'
                        }
                    }
                }, {
                    '$sort': { 'lastEditOn': -1 },
                }

                // Filter:
                // show less than 100 or unseen
            ];

            const YourNotifications = await mongoDB.collection("Notifications")
                .aggregate(YourNotificationsAgg)
                .toArray();

            return YourNotifications;
        },
        InvitationsSentAndThatCouldBeSent: async (_source, {
            type,
            questionText,
            choiceText,
            groupHandle,
            userHandle
        }, { mongoDB, AuthUser }) => {

            // get followers
            // get you to him invite of type

            const Question = (questionText) && await mongoDB.collection("Questions")
                .findOne({ 'questionText': questionText });
            const Group = (groupHandle) && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });
            const User = (userHandle) && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': userHandle });

            const Agg = [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$followedId', {
                                            '$toObjectId': ObjectId(AuthUser._id)
                                        }
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$isFollowing', true
                                    ]
                                }
                            },
                        ],
                    }
                },
                {
                    "$lookup": {
                        "as": "toUser",
                        "from": "Users",
                        let: {
                            'followedId': '$followingId',
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    '$and': [
                                        { "$expr": { "$eq": ["$_id", "$$followedId"] } }
                                    ]
                                }
                            },
                            {
                                '$replaceRoot': {
                                    newRoot: {
                                        $mergeObjects: [
                                            { _id: "$_id" },
                                            "$LiquidUser"
                                        ]
                                    }
                                }
                            },
                        ],
                    }
                }, {
                    "$addFields": { 'toUser': { "$first": "$toUser" } }
                },
                {
                    "$lookup": {
                        "as": "notification",
                        "from": "Notifications",
                        let: {
                            'toUserId': '$toUser._id',
                            'actionUserId': ObjectId(AuthUser._id),
                            'type': type
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    '$and': [
                                        {
                                            "$expr": {
                                                "$eq": ["$toUser", {
                                                    '$toObjectId': "$$toUserId"
                                                }]
                                            }
                                        },
                                        {
                                            "$expr": {
                                                "$eq": ["$actionUser", {
                                                    '$toObjectId': "$$actionUserId"
                                                }]
                                            }
                                        },
                                        { "$expr": { "$eq": ["$type", "$$type"] } },
                                        ...!!Question ? [
                                            { "$expr": { "$eq": ["$question", Question?._id] } }
                                        ] : [],
                                        ...!!choiceText ? [
                                            { "$expr": { "$eq": ["$choiceText", choiceText] } }
                                        ] : [],
                                        ...!!Group ? [
                                            { "$expr": { "$eq": ["$group", Group?._id] } }
                                        ] : [],
                                        ...!!User ? [
                                            { "$expr": { "$eq": ["$user", User?._id] } }
                                        ] : [],
                                    ]
                                }
                            },
                        ],
                    }
                },
                {
                    "$addFields": { 'notification': { "$first": "$notification" } }
                },
            ];

            // const writeToDebugFile = fs.writeFile(
            //     process.cwd() + '/debug' + '/InvitationsSentAndThatCouldBeSent.json',
            //     JSON.stringify(Agg, null, 2),
            //     { encoding: 'utf8' }
            // );

            const NotificationsData = (await mongoDB.collection("UserFollows")
                .aggregate(Agg).toArray()
            );

            return NotificationsData.map(n => ({
                ...n.notification,
                toUser: {
                    ...n.toUser,
                    email: null
                },
                type: n.notification?.type,
                inviteSent: !!n.notification
            }));
        },
    },
    Mutation: {
        markUnseenNotificationsAsSeen: async (_source, { }, { mongoDB, AuthUser }) => {

            const seenNotifications = await mongoDB.collection("Notifications").updateMany({
                'toUser': new ObjectId(AuthUser?._id),
                'seen': false,
            }, {
                $set: {
                    seenOn: Date.now(),
                    seen: true
                },
            })

            return seenNotifications?.modifiedCount;
        },
        sendInviteNotification: async (_source, {
            type,
            toUserHandle,
            questionText,
            groupHandle,
            userHandle
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) return;

            if (
                type !== 'invited_you_to_vote_on_a_poll' &&
                type !== 'invited_you_to_vote_on_group' &&
                type !== 'invited_you_to_vote_on_profile'
            ) return; // to ensure this endpoint is exclusively used for invites


            console.group({
                type,
                toUserHandle,
                questionText,
                groupHandle,
                userHandle
            });

            // TODO: Ensure toUser is following actionUser

            const notification = await saveAndSendNotification({
                type,
                toUser: null,
                toUserHandle,
                actionUser: AuthUser,
                actionUserHandle: null,
                userHandle,
                question: null,
                questionText,
                choiceText: null,
                group: null,
                groupHandle,
                agreesWithYou: null,

                mongoDB,
                AuthUser
            });

            return {
                ...notification
            };
        },
        sendTestNotification: async (_source, {
            type,
            toUserHandle,
            actionUserHandle,
            questionText,
            choiceText,
            groupHandle,
            agreesWithYou,
            userHandle
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser || AuthUser?.LiquidUser?.admin !== 'total') return;

            const notification = await saveAndSendNotification({
                type,
                toUser: null,
                toUserHandle,
                actionUser: null,
                actionUserHandle,
                question: null,
                questionText,
                choiceText,
                group: null,
                groupHandle,
                agreesWithYou,
                userHandle,

                mongoDB,
                AuthUser
            });

            return {
                ...notification
            };
        },
    },
};

export const saveAndSendNotification = async ({
    type,
    toUser,
    toUserHandle,
    actionUser,
    actionUserHandle,
    question,
    questionText,
    choiceText,
    group,
    groupHandle,
    agreesWithYou,
    userHandle,

    mongoDB,
    AuthUser
}) => {

    if (!AuthUser) return;

    const ToUser = toUser || !!toUserHandle && await mongoDB.collection("Users")
        .findOne({ 'LiquidUser.handle': toUserHandle });

    const ActionUser = actionUser || (
        !!actionUserHandle ?
            await mongoDB.collection("Users").findOne({ 'LiquidUser.handle': actionUserHandle }) :
            AuthUser
    );

    const Question = question || (!!groupHandle && !!questionText) ? await mongoDB.collection("Questions")
        .findOne({ questionText, 'groupChannel.group': groupHandle }) : null;

    const Group = group || (!!groupHandle) ? await mongoDB.collection("Groups")
        .findOne({ 'handle': groupHandle }) : null;

    const User = userHandle && await mongoDB.collection("Users").findOne({ 'LiquidUser.handle': userHandle });

    console.log({
        type,
        toUser,
        toUserHandle,
        actionUser,
        actionUserHandle,
        question,
        questionText,
        choiceText,
        group,
        groupHandle,
        agreesWithYou,
        User
    });

    const savedNotification = (await mongoDB.collection("Notifications").findOneAndUpdate(
        {
            type,
            toUser: ToUser?._id,
            actionUser: ActionUser?._id,
            question: Question?._id,
            group: Group?._id
        },
        {
            $set: {
                lastEditOn: Date.now(),
                agreesWithYou,
                seen: false
            },
            $setOnInsert: {
                type,
                toUser: ToUser?._id,
                actionUser: ActionUser?._id,
                question: Question?._id,
                choiceText: choiceText,
                group: Group?._id,
                createdOn: Date.now(),
                user: User?._id
            }
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    ))?.value;

    // if user allows Email
    const emailStatus = false && (
        ToUser.NotificationSettings.allowEmails ||
        typeof ToUser.NotificationSettings?.allowEmails === undefined
    ) ?
        sendEmail({
            toAddress: ToUser.LiquidUser.email,
            subject: `${ActionUser?.LiquidUser?.name} - ${type}`
        }) :
        null;

    const pushNotificationStatus = (!!ToUser?.NotificationSettings?.firebase_token) ?
        sendPushNotification({
            token: ToUser?.NotificationSettings?.firebase_token,
            title: `${ActionUser?.LiquidUser?.name} - ${type}`,
            body: `${ActionUser?.LiquidUser?.name} - ${type}`,
            image: `${ActionUser?.LiquidUser?.avatar}`
        }) :
        null;

    return {
        ...savedNotification,
        emailStatus,
        pushNotificationStatus
    }
};
