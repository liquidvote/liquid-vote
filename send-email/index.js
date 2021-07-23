var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "eu-west-2" });

// Create sendEmail params
var params = {
  Destination: {
    /* required */
    // CcAddresses: [
    //     'EMAIL_ADDRESS',
    //     /* more items */
    // ],
    ToAddresses: [
      "buesimples@gmail.com",
      /* more items */
    ],
  },
  Message: {
    /* required */
    Body: {
      /* required */
      Html: {
        Charset: "UTF-8",
        Data: "Hello",
      },
      Text: {
        Charset: "UTF-8",
        Data: "Hello",
      },
    },
    Subject: {
      Charset: "UTF-8",
      Data: "Hello email",
    },
  },
  Source: "invites@liquid-vote.com" /* required */,
  ReplyToAddresses: [
    "hello@liquid-vote.com",
    /* more items */
  ],
};

// Create the promise and SES service object
var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
  .sendEmail(params)
  .promise();

// Handle promise's fulfilled/rejected states
sendPromise
  .then(function (data) {
    console.log(data.MessageId);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
