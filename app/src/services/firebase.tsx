import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBGF91nW6Ur1OHYNNxHIYjJp3pTspzL6iA",
    authDomain: "liquid-vote.firebaseapp.com",
    projectId: "liquid-vote",
    storageBucket: "liquid-vote.appspot.com",
    messagingSenderId: "726779645976",
    appId: "1:726779645976:web:bd0b137038eeb3f476736d",
    measurementId: "G-8CZ3Y2W5VQ"
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const messaging = getMessaging(firebaseApp);

export const getToken_ = async () => {

    const permission = await Notification?.requestPermission();

    // (localStorage?.getItem('firebase_token') ||

    const firebaseNotificationToken = (permission === 'granted') ? await getToken(messaging, {
        vapidKey: 'BM9ujrzPYIAd7WcscZSrOPw36XfbDYcqtwEYOas5HqZqR8cB4XpUNo2Sc39q0XAMa4CQ31iXh0TPVOHzjT5H5Z0'
    }).then((currentToken) => {
        if (currentToken) {
            console.log('current token for client: ', currentToken);
            // localStorage?.setItem('firebase_token', currentToken);
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    }) : false;

    console.log({ permission, firebaseNotificationToken });

    return {
        permission, firebaseNotificationToken
    };

}

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
});