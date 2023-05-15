const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.commandHistory = functions.https.onCall((data, context) => {
  // function body
});

exports.orderBasket = functions.https.onCall(async (data, context) => {
  if (!context.auth) return "Please log in";
  const userData = await admin.auth().getUser(context.auth.token.uid);

  const firestore = admin.firestore();

  // Check that the 'zone' field is passed in as a parameter
  if (!Object.prototype.hasOwnProperty.call(data, "zone")) {
    throw new functions.https.HttpsError(
        "internal",
        "Zone is not provided",
    );
  }

  // Check that the delivery site exists
  const querySnapshot = await firestore
      .collection("delivery_sites")
      .where("name", "==", data.zone)
      .get();
  if (querySnapshot.empty) {
    throw new functions.https.HttpsError(
        "internal",
        "Zone does not exist",
    );
  }

  const order = {
    basket: {},
    name: userData.displayName,
    email: userData.email,
    verified_acc: userData.emailVerified,
    zone: data.zone,
    timestamp: new Date(),
    uid: userData.uid,
    comment: data.comment,
    floor: data.floor,
  };

  const returnValue = {
    status_code: 1,
    errors: [],
  };

  // Check that the products are still in stock
  for (const product in data.basket) {
    if (Object.prototype.hasOwnProperty.call(data.basket, product)) {
      const basketQuantity = data.basket[product].quantity;
      if (Number.isInteger(basketQuantity)) {
        const doc = await firestore.collection("products").doc(product).get();
        if (!doc.exists) {
          throw new functions.https.HttpsError(
              "internal",
              "Product does not exist in database",
          );
        } else {
          const productData = doc.data();
          if (basketQuantity <= productData.max) {
            if (basketQuantity >= productData.stock) {
              order.basket[product] = productData.stock;
              await firestore
                  .collection("products")
                  .doc(product)
                  .update({
                    stock: 0,
                  });
              returnValue.errors = [
                ...returnValue.errors,
                productData.stock === 0 ?
                  `Il n'y a plus de ${productData.name} en stock.` :
                  `Il ne restait plus que ${productData.stock}
                  ${productData.name} en stock.
                  Ils ont été ajoutés à votre panier.`,
              ];
            } else {
              order.basket[product] = basketQuantity;
              await firestore
                  .collection("products")
                  .doc(product)
                  .update({
                    stock: productData.stock - basketQuantity,
                  });
            }
          }
        }
      } else {
        throw new functions.https.HttpsError(
            "internal",
            "Problem with stock verification",
        );
      }
    }
  }

  console.log(order);

  // Add data to Firestore
  await firestore
      .collection("orders")
      .add(order)
      .then(() => {
        returnValue.status_code = 0;
      })
      .catch((error) => {
        throw new functions.https.HttpsError(
            "internal",
            "An error occurred while adding the user.",
            error,
        );
      });

  return returnValue;
});
