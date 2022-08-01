var admin = require("firebase-admin");
var serviceAccount = require("./service-account-file.json");
admin.initializeApp({
  // make sure to put the initialize before any of the functions i sent you
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://businessaide.firebaseio.com'
});

const send = require('./sender');
const retrieve = require('./retriever');

retrieve.getAllEmployees('adam jerry').then(res => {
  console.log(res);
});