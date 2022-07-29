import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { sendEmail } from './sendEmail';
import { sendNotification } from './sendNotification';

export const NotificationResolvers = {
    Query: {
        Notifications: async (_source, { }, { mongoDB, AuthUser }) => {
            return [];
        },
    },
    Mutation: {
        sendTestNotification: async (_source, {
            type,
            toUserHandle,
            actionUserHandle,
            pollId
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) return;

            const User = !!toUserHandle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': toUserHandle });


            sendEmail({});
            
            if (!!User?.firebase_token) {
                sendNotification({ token: User?.firebase_token });
            }

            return {
                User
            };
        },
    },
};
