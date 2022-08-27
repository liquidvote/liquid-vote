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

            return YourNotifications;
        },
        InvitationsSentAndThatCouldBeSent: async (_source, { }, { mongoDB, AuthUser }) => {
            return [];
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

    const pushNotificationStatus = ( !!ToUser?.NotificationSettings?.firebase_token ) ?
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
