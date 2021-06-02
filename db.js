const admin = require('firebase-admin');
const config = require('./config')
// console.log(config)
// admin.initializeApp(config.firebaseConfig);

admin.initializeApp({
    credential: admin.credential.cert(config.firebaseConfig2)
  });

const db = admin.firestore();
module.exports = db;