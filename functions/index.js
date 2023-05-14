// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.orderBasket = functions.https.onCall((data, context) => {
    if (!context.auth) return "Please log in"

    const firestore = admin.firestore();

    if (! data.hasOwnProperty('zone'))
        throw new functions.https.HttpsError(
            "internal",
            "Zone n'est pas renseigné",
            error
        );
    firestore.collection("delivery_sites").where('name', '==', data?.zone).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                throw new functions.https.HttpsError(
                    "internal",
                    "Zone n'existe pas",
                    error
                );
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de la collection delivery_sites :', error);
        });

    const userData = context.auth.token

    order = {
        basket: { ...data.basket },
        'name': userData?.name,
        'email': userData?.email,
        'verified': userData?.email_verified,
        'zone': data.zone,
        'time': new Date
    }

    console.log(order)

    return
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