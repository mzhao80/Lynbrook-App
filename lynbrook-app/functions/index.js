const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

admin.initializeApp();
const db = admin.firestore();

const expo = new Expo();

exports.announcementNotification = functions.firestore
    .document("/announcements/{annId}")
    .onCreate(async (snap, context) => {
        const val = snap.data();

        let users;
        if (val.from.id == "asb") {
            users = await db.collection("/users").get();
        } else {
            users = await db
                .collection("/users")
                .where("subscribed", "array-contains", val.from)
                .get();
        }

        const messages = [];

        users.forEach((user) => {
            const userval = user.data();
            if (Expo.isExpoPushToken(userval.expoPushToken)) {
                messages.push({
                    to: userval.expoPushToken,
                    sound: "default",
                    title: val.title,
                    body: val.content.substr(0, 100) + "...",
                });
            }
        });

        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
                console.error(error);
            }
        }
    });
