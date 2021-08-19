import { ObjectID } from 'mongodb';

export const InviteResolvers = {
    Query: {
        Invite: async (_source, {
            toWhat,
            toWhom,
            fromWhom,
            Object
        }, { mongoDB, AuthUser }) => {

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
            Invite: { toWhat, toWhom, group, question }
        }, {
            mongoDB, AuthUser, AWS
        }) => {

            console.log({
                toWhat, toWhom
            });

            const toWhomUser = !!toWhom?.user && (await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': toWhom?.user }));

            const Group = await mongoDB.collection("Groups")
                .findOne({ 'handle': group });

            // const Question = await mongoDB.collection("Questions")
            //     .findOne({ 'question': question });

            const Invite_ = !!AuthUser && await mongoDB.collection("Invites")
                .findOne({
                    toWhat,
                    'toWhom.user': toWhomUser?._id,
                    'toWhom.email': toWhom.email,
                    fromWhom: AuthUser?._id,
                });


            const savedInvite = (!!AuthUser && !Invite_) ?
                (async () => {

                    console.log('new invite');

                    const savedInvite_ = (await mongoDB.collection("Invites").insertOne({
                        toWhat, // group | representation | vote | groupAdmin
                        toWhom: {
                            user: toWhomUser?._id,
                            email: toWhom?.email
                        },
                        fromWhom: AuthUser?._id,
                        isAccepted: false,
                        Object,

                        status: 'sent',
                        'lastEditOn': Date.now(),
                        'createdOn': Date.now(),
                    }))?.ops[0];

                    const sentInviteEmail = await sendInviteEmail({
                        AWS,
                        toAddress: toWhom.email || toWhomUser?.LiquidUser?.email,
                        fromWhom: AuthUser,
                        toWhat,
                        group: Group,
                        questionText: question,
                        inviteId: savedInvite_?._id
                    });

                    return savedInvite_;
                })() :

                // (
                //     !!AuthUser &&
                //     Invite_.toWhom === AuthUser.LiquidUser.handle
                // ) ? (await mongoDB.collection("Invites").findOneAndUpdate(
                //     { _id: Invite_._id },
                //     {
                //         $set: {
                //             'isAccepted': isAccepted,
                //             'lastEditOn': Date.now(),
                //         },
                //     },
                //     {
                //         returnNewDocument: true,
                //         returnOriginal: false
                //     }
                // ))?.value

                null;

            return {
                // ...savedInvite
                ...savedInvite
            };
        },
    },
};

const sendInviteEmail = async ({
    AWS,
    toAddress,
    fromWhom,
    toWhat,
    group,
    questionText,
    inviteId
}) => {
    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail({
            Source: "hello@liquid-vote.com",
            Destination: {
                ToAddresses: [toAddress],
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: `
                        ${fromWhom.name}
                        is inviting you to
                        ${toWhat === 'group' ?
                            `join the ${group.name} group` :
                            toWhat === 'representation' ?
                                `be represented by him for ${group.name} group` :
                                toWhat === 'vote' ?
                                    `vote on ${questionText}?` :
                                    toWhat === 'groupAdmin' ?
                                        `become an Admin for ${group.name} group` :
                                        ''
                        }

                    `,
                },
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: "Hello",
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "Hello",
                    },
                },
            },
        })
        .promise();

    await sendPromise
        .then(function (data) {
            console.log(data.MessageId);
            return data;
        })
        .catch(function (err) {
            console.error(err, err.stack);
        });
}