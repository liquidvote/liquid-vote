var AWS = require("aws-sdk");

AWS.config.loadFromPath("./aws-credentials.json");
// Set the region
AWS.config.update({ region: "eu-west-1" });

// Create sendEmail params
var params = {
  Source: "hello@liquid-vote.com",
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
