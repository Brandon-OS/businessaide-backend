// Functions to send data to firestore
var admin = require("firebase-admin");
const db = admin.firestore();
var sc = require("./secret-code"); // secret code prefix

sendEmployer = async (firstName, lastName, secretCode) => {
  // Send employer data on registration
  assign = async (
    firstName,
    lastName,
    secretCode,
  ) => {
    var employerData = {
      firstName: firstName,
      lastName: lastName,
      secretcode: secretCode,
     
    };
    return employerData;
  };
  assign(
    firstName,
    lastName,
    secretCode
  )
    .then((employerData) => {
      db.collection("employers")
        .doc(firstName + " " + lastName)
        .set(employerData);
    })
    .then(() => {
      console.log("Employee data sent!");
    });
};

// send employee data on registration and check to see if secret code is valid
// returns -1 if not valid
sendEmployee = async (
  firstName,
  lastName,
  secretCode,
  dob,
  workExp,
  location,
  title,
  phoneNum,
  dailySalary,
  daysAttended,
  overtimeHourlyRate,
  overtimeHours,
  deductions,
  overallSalary
) => {
  var employer = await sc.findEmployer(secretCode);
  if (employer == -1) {
    console.log("No employer found, double check spelling");
    return -1;
  }

  assign = async (
    firstName,
    lastName,
    secretCode,
    employer,
    dob,
    workExp,
    location,
    title,
    phoneNum,
    dailySalary,
    daysAttended,
    overtimeHourlyRate,
    overtimeHours,
    deductions,
    overallSalary
  ) => {
    var employeeData = {
      firstName: firstName,
      lastName: lastName,
      secretcode: secretCode,
      employer: employer,
      dob: dob,
      workExp: workExp,
      location: location,
      title: title,
      phoneNum: phoneNum,
      dailySalary: dailySalary,
      daysAttended: daysAttended,
      overtimeHourlyRate: overtimeHourlyRate,
      overtimeHours: overtimeHours,
      deductions: deductions,
      overallSalary: overallSalary,
    };
    return employeeData;
  };

  assign(
    firstName,
    lastName,
    secretCode,
    employer,
    dob,
    workExp,
    location,
    title,
    phoneNum,
    dailySalary,
    daysAttended,
    overtimeHourlyRate,
    overtimeHours,
    deductions,
    overallSalary
  )
    .then((employeeData) => {
      db.collection("employees")
        .doc(firstName + " " + lastName)
        .set(employeeData);
      console.log(employeeData);
      db.collection("employers")
        .doc(employer)
        .collection("employees")
        .doc(firstName + " " + lastName)
        .set(employeeData);
    })
    .then(() => {
      console.log("Employee data sent!");
    });
};

tempSendEmployee = (firstName, lastName, teamLeader) => {
  const tempData = {
    Firstname: firstName,
    Lastname: lastName,
    TeamLeader: teamLeader,
  };
  db.collection("Employees")
    .doc(firstName + lastName)
    .set(tempData);
  console.log("Employee data sent!");
};




sendPayroll = async(dailySalary, daysAttended, overtimeHourlyRate, overtimeHours, deductions, overallSalary, employeeName, employerName) => {
  assign = (dailySalary, daysAttended, overtimeHourlyRate, overtimeHours, deductions, overallSalary) => {
    var payrollData = {
      dailySalary: dailySalary, 
      daysAttended: daysAttended,
      overtimeHourlyRate: overtimeHourlyRate,
      overtimeHours: overtimeHours,
      Deductions: deductions, 
      overallSalary: overallSalary
    }
    return payrollData;
  }

  const payrollData = await assign(dailySalary, daysAttended, overtimeHourlyRate, overtimeHours, deductions, overallSalary);
  employerRef = db.collection('employers').doc(employerName).collection('employees').doc(employeeName);
  employeeRef = db.collection('employees').doc(employeeName);
  const employerDoc = await employerRef.get();
  const employeeDoc = await employeeRef.get();
  if (!employerDoc.exists) {
    result = {status: 'error', reason: 'No employees with that name were found under that employer! Try checking your spelling!'};
    console.log(result);
    return result;
  } else {
    employerRef.update(payrollData);
  }

  if (!employeeDoc.exists) {
    result = {status: 'error', reason: 'No employees with that name were found! Try checking your spelling!'};
    console.log(result);
    return result;
  } else {
    employeeRef.update(payrollData);
  }

  result = {status: 'success', reason: 'Payroll data has been sent!'};
  console.log(result);
  return result;
}

module.exports = { sendEmployer, sendEmployee, tempSendEmployee, sendPayroll };

