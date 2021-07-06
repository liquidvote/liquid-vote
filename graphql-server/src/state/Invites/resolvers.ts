import { ObjectID } from 'mongodb';

export const InviteResolvers = {
    Query: {
        Invite: async (_source, {
            toWhat,
            toWhom,
            fromWhom,
            Object
        }, { mongoDB, s3, AuthUser }) => {

            const Invite = await mongoDB.collection("Invites")
                .findOne({
                    toWhat,
                    toWhom,
                    fromWhom,
                    Object
                });

            return {
                ...Invite
            };
        },
    },
    Mutation: {
        editInvite: async (_source, {
            toWhat,
            toWhom,
            fromWhom,
            isAccepted,
            Object
        }, {
            mongoDB, s3, AuthUser
        }) => {

            const Invite_ = !!AuthUser && await mongoDB.collection("Invites")
                .findOne({
                    toWhat,
                    toWhom,
                    fromWhom,
                    isAccepted,
                    Object
                });

            const savedInvite = (!!AuthUser && !Invite_) ?
                (await mongoDB.collection("Invites").insertOne({
                    toWhat,
                    toWhom,
                    fromWhom,
                    isAccepted: false,
                    Object,

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                    'user': AuthUser.LiquidUser.handle
                }))?.ops[0] : (
                    !!AuthUser &&
                    Invite_.toWhom === AuthUser.LiquidUser.handle
                ) ? (await mongoDB.collection("Invites").findOneAndUpdate(
                    { _id: Invite_._id },
                    {
                        $set: {
                            'isAccepted': isAccepted,
                            'lastEditOn': Date.now(),
                        },
                    },
                    {
                        returnNewDocument: true,
                        returnOriginal: false
                    }
                ))?.value : null;

            return {
                ...savedInvite
            };
        },
    },
};