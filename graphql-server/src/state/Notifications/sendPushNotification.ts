const admin = require('firebase-admin');

const serviceAccount = require("../../../credentials/liquid-vote-firebase-adminsdk-bfcij-4fc3b446c4.json");

// Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const sendPushNotification = async ({
    token,
    title,
    body,
    image,
    inviteLink
}) => {
    const message = {
        notification: {
            "title": title,
            "body": body,
            "image": image,
            "click_action": inviteLink || "https://liquid-vote.com/notifications"
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