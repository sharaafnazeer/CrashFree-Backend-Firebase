'use strict';

const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();

const {
    PORT,
    HOST,
    HOST_URL,
    TYPE,
    API_KEY,
    AUTH_DOMAIN,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    APP_ID,

    PROJECT_ID,
    PRIVATE_KEY_ID,
    PRIVATE_KEY,
    CLIENT_EMAIL,
    CLIENT_ID,
    AUTH_URI,
    TOKEN_URI,
    AUTH_PROVIDER,
    CLIENT_URL,
} = process.env;

assert(PORT, 'Port is required');
assert(HOST, 'Host is required');


module.exports = {
    port : PORT,
    host : HOST,
    url : HOST_URL,
    firebaseConfig : {
        apiKey: API_KEY,
        authDomain: AUTH_DOMAIN,
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET,
        messagingSenderId: MESSAGING_SENDER_ID,
        appId: APP_ID,
      },
      firebaseConfig2 : {
        type: TYPE,
        project_id: PROJECT_ID,
        private_key_id: PRIVATE_KEY_ID,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: CLIENT_EMAIL,
        client_id: CLIENT_ID,
        auth_uri: AUTH_URI,
        token_uri: TOKEN_URI,
        auth_provider_x509_cert_url: AUTH_PROVIDER,
        client_x509_cert_url: CLIENT_URL
      }
}