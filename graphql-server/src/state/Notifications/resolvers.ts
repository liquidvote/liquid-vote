import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { sendEmail } from './sendEmail';

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

            sendEmail({});
            
            return {};
        },
    },
};
