// var admin = require("firebase-admin");

// var serviceAccount = require("../crashfree-sdk.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// class Message {
//     static send(registrationToken, payload) {

//           const options = {
//               priority: 'high',
//               timeToLive: 60*60*24
//           }
          
//           admin.messaging()
//               .sendToDevice(registrationToken, payload, options)
//               .then((response) => {
//                   console.log('Sucessfully send message');
//                   console.log(response);
//               })
//               .catch(error => {
//                   console.log('Error while send message');
//                   console.log(error);
//               });
//     }
// }

// module.exports = Message;