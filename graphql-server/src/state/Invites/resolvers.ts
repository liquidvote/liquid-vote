import { ObjectId } from 'mongodb';

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

        Invites: async (_source, {
            groupHandle,
            invitedUserHandle
        }, { mongoDB, AuthUser }) => {

            const Group = (groupHandle) && await mongoDB.collection("Groups")
                .findOne({ 'handle': groupHandle });

            const fromWhomUser = (!!AuthUser) && await mongoDB.collection("Users")
                .findOne({ 'handle': AuthUser?._id });

            const toWhomUser = (invitedUserHandle) && await mongoDB.collection("Users")
                .findOne({ 'handle': invitedUserHandle });

            const Invites = await mongoDB.collection("Invites")
                .aggregate([
                    {
                        '$match': {
                            '$or': [
                                ...(Group) ? [
                                    { 'toWhat.group': new ObjectId(Group?._id) }
                                ] : [],
                                ...(fromWhomUser) ? [
                                    { 'fromWhom': new ObjectId(fromWhomUser?._id) }
                                ] : [],
                                ...(toWhomUser) ? [
                                    { 'toWhom.user': new ObjectId(toWhomUser?._id) }
                                ] : [],
                            ]
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'Users',
                            'let': {
                                'toWhom': '$toWhom'
                            },
                            'pipeline': [
                                {
                                    '$match': {
                                        '$or': [
                                            {
                                                '$expr': {
                                                    '$eq': [
                                                        '$LiquidUser.email', '$$toWhom.email'
                                                    ]
                                                }
                                            }, {
                                                '$expr': {
                                                    '$eq': [
                                                        '$_id', '$$toWhom.user'
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ],
                            'as': 'User'
                        }
                    }, {
                        '$addFields': {
                            'toWhom.user': {
                                '$first': '$User.LiquidUser'
                            }
                        }
                    }
                ])
                .toArray();

            return Invites;
        },
    },
    Mutation: {
        editInvite: async (_source, {
            Invite: { toWhat, toWhom, group, question }
        }, {
            mongoDB, AuthUser, AWS
        }) => {

            // console.log({
            //     toWhat, toWhom, group, question
            // });

            const toWhomUser = !!toWhom?.user && (await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': toWhom?.user }));

            const Group = (toWhat.type === 'group') && await mongoDB.collection("Groups")
                .findOne({ 'handle': toWhat.group });

            const Question = (toWhat.type === 'vote') && await mongoDB.collection("Questions")
                .findOne({ 'question': toWhat.question });

            const User = (toWhat.type === 'representation') && await mongoDB.collection("User")
                .findOne({ 'question': toWhat.user });

            const Invite_ = !!AuthUser && await mongoDB.collection("Invites")
                .findOne({
                    'toWhat.type': toWhat?.type,
                    'toWhom.user': toWhomUser?._id,
                    'toWhom.email': toWhom.email,
                    fromWhom: AuthUser?._id,
                });


            const savedInvite = (!!AuthUser && !Invite_) ?
                (async () => {

                    // console.log('new invite', toWhom);

                    const savedInvite_ = (await mongoDB.collection("Invites").insertOne({
                        toWhat: {
                            type: toWhat.type,
                            group: Group?._id,
                            question: Question?._id,
                            user: User?._id
                        },
                        toWhom: {
                            user: toWhomUser?._id,
                            email: toWhom?.email
                        },
                        fromWhom: AuthUser?._id,
                        isAccepted: false,

                        status: 'sent',
                        'lastEditOn': Date.now(),
                        'createdOn': Date.now(),
                    }))?.ops[0];

                    const sentInviteEmail = await sendInviteEmail({
                        AWS,
                        toAddress: toWhom.email || toWhomUser?.LiquidUser?.email,
                        fromWhom: AuthUser?.LiquidUser,
                        toWhat: {
                            type: toWhat.type,
                            group: Group,
                            question: Question,
                            user: User
                        },
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
    inviteId
}) => {

    // console.log({
    //     toAddress
    // });

    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail({
            Source: "Invite@liquid-vote.com",
            Destination: {
                ToAddresses: [toAddress],
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: `
                        ${fromWhom.name}
                        is inviting you to
                        ${toWhat.type === 'group' ?
                            `join ${toWhat.group.name}` :
                            toWhat.type === 'representation' ?
                                `be represented by him in ${toWhat.group.name}` :
                                toWhat.type === 'vote' ?
                                    `vote on ${toWhat.questionText}?` :
                                    toWhat.type === 'groupAdmin' ?
                                        `become an Admin of ${toWhat.group.name} group` :
                                        ''
                        }

                    `,
                },
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `
                            ${toWhat.type === 'group' ?
                                `<a href="http://localhost:8080/group/${toWhat.group.handle}?${new URLSearchParams({
                                    modal: 'AcceptInvite',
                                    modalData: JSON.stringify({
                                        toWhat: 'group',
                                        groupName: toWhat.group.name,
                                        groupHandle: toWhat.group.handle,
                                        fromWhomAvatar: fromWhom.avatar,
                                        fromWhomName: fromWhom.name,
                                        fromWhomHandle: fromWhom.handle
                                    }),
                                    inviteId
                                }).toString()

                                }"> Accept Invite</a>` :
                                toWhat === 'representation' ?
                                    `TODO` :
                                    toWhat === 'vote' ?
                                        `TODO` :
                                        toWhat === 'groupAdmin' ?
                                            `TODO` :
                                            ''
                            }
                        `,
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
            // console.log(data.MessageId);
            return data;
        })
        .catch(function (err) {
            console.error(err, err.stack);
        });
}

export const updateInviteStatus = async ({
    InviteId,
    to = "accepted",
    mongoDB
}) => {

    // console.log({ InviteId, to });

    const updatedInvite = (await mongoDB.collection("Invites").findOneAndUpdate(
        { _id: new ObjectId(InviteId) },
        {
            $set: {
                ...(to === 'accepted') && { isAccepted: true },
                status: to,
            }
        },
        {
            returnNewDocument: true,
            returnOriginal: false
        }
    ))?.value;

    return updatedInvite;
}