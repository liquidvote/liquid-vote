var AWS = require("aws-sdk");
const ejs = require("ejs");

const awsCredentials = require("../../../credentials/aws-credentials.json");

// AWS
AWS.config.credentials = awsCredentials;
AWS.config.update({ region: "eu-west-1" });

export const sendEmail = async ({
    toAddress,
    subject,
    data: {
        inviteLink,
        type,
        agreesWithYou,
        question,
        group,
        choiceText,
        actionUser,
        toUser,
        user
    }
    // fromWhom,
    // toWhat,
    // inviteId
}) => {

    // console.log({
    //     toAddress
    // });


    const emailHtml = await (new Promise(resolve => {
        ejs.renderFile(__dirname + "/emailTemplate.ejs", {
            type,
            agreesWithYou,
            question,
            group,
            choiceText,
            actionUser,
            toUser,
            user,
            inviteLink
        }, (err, result) => {
            if (err) {
                console.log(err);
            }
            resolve(result);
        });
    }));

    // console.log({ emailHtml, inviteLink });



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
                        Data: emailHtml,
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: subject,
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