// Module for Secret Code purposes
var admin = require("firebase-admin");
const db = admin.firestore();

// Function to validate if a secret code is a duplicate and is already linked to an employer
dupeCheck = async (secretCode) => {
  // if returns 0 => there's no record, if 1 => there's a record
  const employers = db.collection("employers");
  const snapshot = await employers.where("secretcode", "==", secretCode).get();
  if (snapshot.empty) {
    console.log("Secret code is unique");
    return 0;
  }

  snapshot.forEach((doc) => {
    console.log(
      "Secret Code belongs to: " +
        doc.data().firstName +
        " " +
        doc.data().lastName
    );
  });
  return 1;
};

// Function to make an 8 digit secret alphabetical-numeric code for the employer
make = () => {
  // code to make the secret code
  const typescript = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  var code = "";
  for (let i = 0; i < 8; ++i) {
    code += typescript[Math.floor(Math.random() * 36)];
  }

  // code to check if the secret code has been used
  if (this.dupeCheck(code) == 1) {
    make();
  } else {
    console.log(code);
  }
  console.log("secret code made");
  return code;
};

// Function to find the employer with the corresponding secret code
// returns the name of the employer if found, and returns -1 if not found
findEmployer = async (secretCode) => {
  const employers = db.collection("employers");
  const snapshot = await employers.where("secretcode", "==", secretCode).get();
  if (snapshot.empty) {
    console.log("No employer found");
    return -1;
  }

  create = (snapshot) => {
    var employerName;
    snapshot.forEach((doc) => {
      employerName = doc.data().firstName + " " + doc.data().lastName;
    });
    return employerName;
  };

  let employerName = await create(snapshot);
  console.log(employerName);
  console.log("employer found");
  return employerName;
};



module.exports = { make, dupeCheck, findEmployer };
