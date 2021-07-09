var admin = require("firebase-admin");

// var serviceAccount = require("../crashfree-sdk.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

class Message {
    static async send(registrationTokens, payload) {

          const options = {
              priority: 'high',
              contentAvailable: true,
              timeToLive: 60*60*24
          }
          
          await admin.messaging()
              .sendToDevice(registrationTokens, payload, options)
              .then((response) => {
                  console.log('Sucessfully send message');
                  console.log(response);
              })
              .catch(error => {
                  console.log('Error while send message');
                  console.log(error);
                  Promise.reject(error);
              });
    }
}

module.exports = Message;