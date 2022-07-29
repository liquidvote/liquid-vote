var AWS = require("aws-sdk");

const awsCredentials = require("../../../credentials/aws-credentials.json");

// AWS
AWS.config.credentials = awsCredentials;
AWS.config.update({ region: "eu-west-1" });

export const sendEmail = async ({
    // toAddress,
    // fromWhom,
    // toWhat,
    // inviteId
}) => {

    // console.log({
    //     toAddress
    // });

    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail({
            Source: "notification@liquid-vote.com",
            Destination: {
                ToAddresses: ["buesimples@gmail.com"],
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: "Hello email",
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

            // Message: {
            //     Subject: {
            //         Charset: "UTF-8",
            //         Data: `
            //             ${fromWhom.name}
            //             is inviting you to
            //             ${toWhat.type === 'group' ?
            //                 `join ${toWhat.group.name}` :
            //                 toWhat.type === 'representation' ?
            //                     `be represented by him in ${toWhat.group.name}` :
            //                     toWhat.type === 'vote' ?
            //                         `vote on ${toWhat.questionText}?` :
            //                         toWhat.type === 'groupAdmin' ?
            //                             `become an Admin of ${toWhat.group.name} group` :
            //                             ''
            //             }

            //         `,
            //     },
            //     Body: {
            //         Html: {
            //             Charset: "UTF-8",
            //             Data: `
            //                 ${toWhat.type === 'group' ?
            //                     `<a href="http://localhost:8080/group/${toWhat.group.handle}?${new URLSearchParams({
            //                         modal: 'AcceptInvite',
            //                         modalData: JSON.stringify({
            //                             toWhat: 'group',
            //                             groupName: toWhat.group.name,
            //                             groupHandle: toWhat.group.handle,
            //                             fromWhomAvatar: fromWhom.avatar,
            //                             fromWhomName: fromWhom.name,
            //                             fromWhomHandle: fromWhom.handle
            //                         }),
            //                         inviteId
            //                     }).toString()

            //                     }"> Accept Invite</a>` :
            //                     toWhat === 'representation' ?
            //                         `TODO` :
            //                         toWhat === 'vote' ?
            //                             `TODO` :
            //                             toWhat === 'groupAdmin' ?
            //                                 `TODO` :
            //                                 ''
            //                 }
            //             `,
            //         },
            //         Text: {
            //             Charset: "UTF-8",
            //             Data: "Hello",
            //         },
            //     },
            // },
        })
        .promise();

    await sendPromise
        .then(function (data) {
            console.log(data);
            return data;
        })
        .catch(function (err) {
            console.error(err, err.stack);
        });
}