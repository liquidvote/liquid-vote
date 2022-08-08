const admin = require('firebase-admin');

const serviceAccount = require("../../../credentials/liquid-vote-firebase-adminsdk-bfcij-4fc3b446c4.json");

// Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const sendNotification = async ({
    token
    // toAddress,
    // fromWhom,
    // toWhat,
    // inviteId
}) => {
    const message = {
        notification: {
            "title": "Recebeste esta fritaria?",
            "body": "Recebeste esta fritaria?",
            "image": "https://images.liquid-vote.com/system/logo.png"
        },
        token
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}