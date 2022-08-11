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
                        }
                    }
                }, {
                    '$sort': { 'lastEditOn': -1 }
                }
            ];

            const YourNotifications = await mongoDB.collection("Notifications")
                .aggregate(YourNotificationsAgg)
                .toArray();

            console.log({
                YourNotifications
            });

            return YourNotifications;
        },
        InvitationsSentAndThatCouldBeSent: async (_source, { }, { mongoDB, AuthUser }) => {
            return [];
        },
    },
    Mutation: {
        sendTestNotification: async (_source, {
            type,
            toUserHandle,
            actionUserHandle,
            questionText,
            choiceText,
            groupHandle,
            agreesWithYou
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) return;

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

                mongoDB,
                AuthUser
            });

            return {
                ...notification
            };
        },
    },
};

const saveAndSendNotification = async ({
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

    mongoDB,
    AuthUser
}) => {

    if (!AuthUser) return;

    const User = toUser || !!toUserHandle && await mongoDB.collection("Users")
        .findOne({ 'LiquidUser.handle': toUserHandle });

    const ActionUser = actionUser || !!actionUserHandle ? await mongoDB.collection("Users")
        .findOne({ 'LiquidUser.handle': actionUserHandle }) : AuthUser;

    const Question = question || (!!groupHandle && !!questionText) ? await mongoDB.collection("Questions")
        .findOne({ questionText, 'groupChannel.group': groupHandle }) : null;

    const Group = group || (!!groupHandle) ? await mongoDB.collection("Groups")
        .findOne({ 'handle': groupHandle }) : null;

    const savedNotification = (await mongoDB.collection("Notifications").findOneAndUpdate(
        {
            type,
            toUser: User?._id,
            actionUser: ActionUser?._id,
            question: Question?._id,
            group: Group?._id
        },
        {
            $set: {
                lastEditOn: Date.now()
            },
            $setOnInsert: {
                type,
                toUser: User?._id,
                actionUser: ActionUser?._id,
                question: Question?._id,
                choiceText: choiceText,
                group: Group?._id,
                createdOn: Date.now(),
                agreesWithYou
            }
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    ))?.value

    // if user allows Email
    const emailStatus = (User.NotificationSettings.allowEmails || typeof User.NotificationSettings?.allowEmails === undefined) ?
        sendEmail({
            toAddress: User.LiquidUser.email,
            subject: `${ActionUser?.LiquidUser?.name} - ${type}`
        }) :
        null;

    // if user allows Notification
    const pushNotificationStatus = ((User.NotificationSettings.allowNotifications || typeof User.NotificationSettings?.allowNotifications === undefined) && !!User?.NotificationSettings?.firebase_token) ?
        sendPushNotification({ token: User?.NotificationSettings?.firebase_token }) :
        null;

    return {
        ...savedNotification,
        emailStatus,
        pushNotificationStatus
    }
};
