// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.commandHistory = functions.https.onCall((data, context) => {

});

exports.orderBasket = functions.https.onCall((data, context) => {

    if (!context.auth) return "Please log in"
    const userData = context.auth.token

    const firestore = admin.firestore();

    if (!data.hasOwnProperty('zone'))
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

    for (let product in data?.basket) {
        const basketQuantity = data?.basket[product]?.quantity
        if (Number.isInteger(basketQuantity)) {

        }

    }

    order = {
        basket: { ...data.basket },
        'name': userData?.name,
        'email': userData?.email,
        'verified_acc': userData?.email_verified,
        'zone': data.zone,
        'timestamp': new Date(),
        'uid': userData?.uid
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