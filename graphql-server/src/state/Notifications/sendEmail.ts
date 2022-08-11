var AWS = require("aws-sdk");

const awsCredentials = require("../../../credentials/aws-credentials.json");

// AWS
AWS.config.credentials = awsCredentials;
AWS.config.update({ region: "eu-west-1" });

export const sendEmail = async ({
    toAddress,
    subject
    // fromWhom,
    // toWhat,
    // inviteId
}) => {

    // console.log({
    //     toAddress
    // });

    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail({
            Source: 'Liquid Vote <notification@liquid-vote.com>',
            Destination: {
                ToAddresses: [toAddress],
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: "🧪",
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "🧪",
                    },
                },
            },
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