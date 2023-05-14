// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.commandHistory = functions.https.onCall((data, context) => {

});


const returns = {
    ok: {
        status_code: 0,
        message: "votre commande a été passée avec succès."
    },
}


exports.orderBasket = functions.https.onCall(async (data, context) => {

    if (!context.auth) return "Please log in"
    const userData = context.auth.token

    const firestore = admin.firestore();

    // Vérifie que le champs zone est bien passé en en paramètres.
    if (!data.hasOwnProperty('zone'))
        throw new functions.https.HttpsError(
            "internal",
            "Zone n'est pas renseigné",
            error
        );

    // Vérifie que le site de livraison existe.
    await firestore.collection("delivery_sites").where('name', '==', data?.zone).get()
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

    // Vérifie que les produits sont toujours en stock.
    for (let product in data?.basket) {
        // Product est la clé du produit et est équivalent au champs 'name' dans la base firestore.
        const basketQuantity = data?.basket[product]?.quantity // On récupère la quantité du produit.

        if (Number.isInteger(basketQuantity)) { // On vérifie que la quantité récupérée est typée de manière cohérente (et non nulle.)

            await firestore.collection("products").where('name', '==', product).get().then(querySnapshot => {
                // On va vérifier que les stocks sont suffiants.
                if (querySnapshot.empty) throw new functions.https.HttpsError(
                    "internal",
                    "Produit n'existe pas en base.",
                    error
                )
                else {

                }

            }).catch(error => {
                console.error('Erreur lors de la récupération des produits dans la base de données :', error)
            })
        } else
            throw new functions.https.HttpsError(
                "internal",
                "Problème lors de la vérification des stocks",
                error
            );
    }


    // Data envoyée dans 'orders' finalement.
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

    // Envoie des données en base.
    firestore.collection("orders").add(data)
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