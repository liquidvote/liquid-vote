/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js')

firebase.initializeApp({
    apiKey: "AIzaSyBGF91nW6Ur1OHYNNxHIYjJp3pTspzL6iA",
    authDomain: "liquid-vote.firebaseapp.com",
    projectId: "liquid-vote",
    storageBucket: "liquid-vote.appspot.com",
    messagingSenderId: "726779645976",
    appId: "1:726779645976:web:bd0b137038eeb3f476736d",
    measurementId: "G-8CZ3Y2W5VQ"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || payload.notification.image,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', (event) => {
  if (event.action) {
    clients.openWindow(event.action)
  }
  event.notification.close()
})