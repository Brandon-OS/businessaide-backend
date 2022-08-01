// Module to get data from the database; returns information in an array
var admin = require("firebase-admin");
const db = admin.firestore();

// Function to find the type of user (either employer or employee) by searching the users database
// Access value in result body
findUserType = async (email) => {
  const userRef = db.collection("users");
  const snapshot = await userRef.where("username", "==", email).get();
  if (snapshot.empty) {
    const result = {
      status: "error",
      reason: "There is no user with the corresponding email",
    };
    return result;
  }

  var name = "";

  var count = 0;
  snapshot.forEach((doc) => {
    count += 1;
    name = doc.data().fullname;
  });

  if (count >= 2) {
    const result = {
      status: "error",
      reason: "There are multiple users with that email",
    };
    return result;
  }

  const employerCheck = await db
    .collection("employers")
    .doc(name)
    .get();
  const employeeCheck = await db
    .collection("employees")
    .doc(name)
    .get();

  if (employerCheck.exists) {
    const result = {
      status: "success",
      reason: "The user is an employer",
      body: "employer",
      name,
    };
    return result;
  }

  if (employeeCheck.exists) {
    const result = {
      status: "success",
      reason: "The user is an employee",
      body: "employee",
      name,
    };
    return result;
  }
};


getEmployerName = async (employeeName) => {
  const employeeRef = db.collection("employees").doc(employeeName);
  let doc = await employeeRef.get();
  console.log(doc);
  secretCode = doc.data().secretcode;
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
  if (employerName !== undefined) {
    return { status: "success", employerName };
  }
};

getEmployeeData = async (employeeName) => {
  const employees = db.collection("employees");
  const nameArray = employeeName.split(" ");
  const nameRef = employees
    .where("firstName", "==", nameArray[0])
    .where("lastName", "==", nameArray[1]);
  const snapshot = await nameRef.get();
  if (snapshot.empty) {
    console.log("Cannot find an employee with a matching name");
    return -1;
  }

  assign = async (snap) => {
    snap.forEach(
      (doc) =>
        (dataObj = {
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          dob: doc.data().dob,
          workExp: doc.data().workExp,
          location: doc.data().location,
          title: doc.data().title,
          phoneNum: doc.data().phoneNum,
          overallSalary: doc.data().overallSalary,
        })
    );
    return dataObj;
  };

  var data = await assign(snapshot);
  console.log("employee data found");
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: data,
  };
  return result;
};

// Function get sub task data and returns it in the form of an object
// Employer name has to be in the form of 'firstName lastName'
getSubTaskData = async (subTaskName, mainTaskName, employerName) => {
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .doc(subTaskName)
    .get();
  if (snapshot.empty) {
    console.log("Cannot find a matching subtask");
    return -1;
  }

  assign = async (doc) => {
    dataObj = {
      subTaskName: doc.id,
      description: doc.data().description,
      workers: doc.data().workers,
      goal: doc.data().goal,
      progress: doc.data().progress,
      status: doc.data().status,
      currentTask: doc.data().currentTask,
    };
    console.log(dataObj);
    return dataObj;
  };
  var data = await assign(snapshot);
  console.log("sub task data found");
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: data,
  };
  return result;
};

// Function to get Main Task data and the name of its subtasks in the form of an object
// Returns subtasks in the form of an array
getMainTaskData = async (mainTaskName, employerName) => {
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .get();
  if (snapshot.empty) {
    console.log("Cannot find the Main Task");
    return -1;
  }

  const snappy = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .get();
  var subTaskArray = [];
  if (snappy.empty) {
    console.log("Cannot find a subtask");
  }

  await snappy.forEach((doc) => {
    subTaskArray.push(doc.id);
  });

  assign = async (snapshot, subTaskArray) => {
    dataObj = {
      description: snapshot.data().description,
      status: snapshot.data().status,
      workers: snapshot.data().workers,
      subtasks: subTaskArray,
    };
    console.log(dataObj.workers);
    return dataObj;
  };

  var data = await assign(snapshot, subTaskArray);
  // console.log(data);

  console.log("main task data found");
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: data,
  };
  return result;
};

// Function to get the names of all main tasks of an employer
getAllTaskData = async (employerName) => {
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .get();
  if (snapshot.empty) {
    result = {
      status: "empty",
      reason: "This employer has not assigned any tasks",
      body: [],
    };
  }
  wait = async (snapshot) => {
    tempTaskArray = [];
    snapshot.forEach((doc) => {
      tempTaskArray.push(doc.id);
    });
    return tempTaskArray;
  };
  let mainTaskArray = await wait(snapshot);
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: mainTaskArray,
  };
  return result;
};

getAllEmployeeTaskData = async (employeeName) => {
  const snapshot = await db
    .collection("employees")
    .doc(employeeName)
    .collection("tasks")
    .get();
  if (snapshot.empty) {
    result = {
      status: "empty",
      reason: "This employee has not been assigned any tasks",
      body: [],
    };
  }
  wait = async (snapshot) => {
    tempTaskArray = [];
    snapshot.forEach((doc) => {
      tempTaskArray.push(doc.id);
    });
    return tempTaskArray;
  };
  let mainTaskArray = await wait(snapshot);
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: mainTaskArray,
  };
  return result;
};

// Function to get the names of all unfinished main tasks
getUnfinishedTasks = async (employerName) => {
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .where("status", "==", "in progress")
    .get();
  if (snapshot.empty) {
    result = {
      status: "error",
      reason: "This employer does not have any tasks in progress",
    };
    return result;
  }
  wait = async (snapshot) => {
    tempTaskArray = [];
    snapshot.forEach((doc) => {
      data = { name: doc.id, progress: doc.data().progress };
      tempTaskArray.push(data);
    });
    return tempTaskArray;
  };
  let taskArray = await wait(snapshot);
  result = {
    status: "success",
    reason: "Retrieved all of the tasks in progress",
    body: taskArray,
  };
  return result;
};

// Function to get the names of all finished main tasks
getFinishedTasks = async (employerName) => {
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .where("status", "==", "finished")
    .get();
  if (snapshot.empty) {
    result = {
      status: "error",
      reason: "This employer does not have any finished tasks",
    };
    return result;
  }
  wait = async (snapshot) => {
    tempTaskArray = [];
    snapshot.forEach((doc) => {
      data = { name: doc.id, progress: doc.data().progress };
      tempTaskArray.push(data);
    });
    return tempTaskArray;
  };
  let taskArray = await wait(snapshot);
  result = {
    status: "success",
    reason: "Retrieved all of the finished tasks",
    body: taskArray,
  };
  return result;
};

// Function to return an array of all employee names under an employer

// Function to that returns an array of all employees under en employer and their respective salaries
// Return in the form of an object
getAllEmployeeSalary = async (employerName) => {
  employerRef = db
    .collection("employers")
    .doc(employerName)
    .collection("employees");
  const snapshot = await employerRef.get();
  if (snapshot.empty) {
    result = {
      status: "error",
      reason: "This employer does not have any employees under him!",
      body: [],
    };
    return result;
  }

  assign = (name, overallSalary) => {
    dataObj = {
      name: name,
      overallSalary: overallSalary,
    };
    return dataObj;
  };

  let employeeArray = [];
  snapshot.forEach((employee) => {
    const data = assign(employee.id, employee.data().overallSalary);
    employeeArray.push(data);
  });

  if (employeeArray.length == snapshot.size) {
    result = {
      status: "success",
      reason: "Employee salary has been successfull compiled!",
      body: employeeArray,
    };
    return result;
  }
};
module.exports = {
  getEmployeeData,
  getSubTaskData,
  getMainTaskData,
  getAllTaskData,
  getUnfinishedTasks,
  getFinishedTasks,
  findUserType,
  getAllEmployeeSalary,
  getAllEmployeeTaskData,
  getEmployerName,
};
