// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.orderBasket = functions.https.onCall((data, context) => {
    if (!context.auth) return "Please log in"

    const firestore = admin.firestore();

    return firestore.collection("orders").add(data)
        .then((docRef) => {
            return {
                message: `Commande créée.`
            };
        })
        .catch((error) => {
            throw new functions.https.HttpsError(
                "internal",
                "Une erreur s'est produite lors de l'ajout de l'utilisateur.",
                error
            );
        });
})