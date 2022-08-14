// Module of functions to handle all task functions by the employer
var admin = require("firebase-admin");
const { findEmployer } = require("./secret-code");
const db = admin.firestore();

// Function to update main tasks for employees in employees > tasks
// Currently not exported
createEmployeeMainTask = async (employeeName, mainTaskName, taskData) => {
  employeeRef = db.collection("employees").doc(employeeName);
  let employeedoc = await employeeRef.get();
  if (!employeedoc.exists) {
    result = {
      status: "error",
      reason: employeeName + " was not found! Try checking your spelling!",
    };
    return result;
  }

  taskRef = employeeRef.collection("tasks").doc(mainTaskName);
  await taskRef.set(taskData);
  result = {
    status: "success",
    reason: mainTaskName + " was successfully assigned to " + employeeName,
  };
  console.log(result);
  return result;
};

// Function to create the task and send it to the database
// employerName should be in the format: 'firstname lastname'
createMainTask = async (
  mainTaskName,
  mainTaskDesc,
  employerName,
  workerArray
) => {
  let taskData = {
    description: mainTaskDesc,
    workers: workerArray,
    status: "in progress",
  };
  // update employees database to track what they are currently working on
  updateEmployees = async (mainTaskName, employerName, workerArray) => {
    // Format employee database
    /*employeeRef = db
      .collection("employees")
      .doc(employeeName)
      .collection("tasks");
*/
    console.log(workerArray);
    for (i = 0; i < workerArray.length; i++) {
      employeeName = workerArray[i];
      console.log(employeeName);
      // check if the employee is under that employer, if not return error status
      docRef = db
        .collection("employers")
        .doc(employerName)
        .collection("employees")
        .doc(employeeName);
      let snapshot = await docRef.get();
      if (!snapshot.exists) {
        // if the doc doesnt exist
        result = {
          status: "error",
          reason:
            "No employee named" +
            employeeName +
            "were found under employer " +
            employerName +
            "! Try checking your spelling!",
        };
        console.log(result);
        return result;
      }

      let res = await createEmployeeMainTask(
        employeeName,
        mainTaskName,
        taskData
      );
      if (res.status == "error") {
        console.log(res);
        return res;
      }

      // Currently unneeded due to reformatting of database
      // employeeRef = db.collection("employees").doc(employeeName);
      // let doc = await employeeRef.get();
      // if (!doc.data().currentTask) { // Employee currently does not have any main tasks
      //   mainTaskData = {name: mainTaskName, subTasks: []};
      //   data = {mainTasks: [mainTaskData]};
      // } else {  // If Employee already has a main task
      //   data = doc.data().currentTask;
      //   mainTaskData = {name: mainTaskName, subTasks: []};
      //   data.mainTasks.push(mainTaskData);
      // }

      // employeeRef.update({
      //   currentTask: data,
      // });
      // docRef.update({
      //   currentTask: data,
      // });
    }
    /*esult = {
        status: "success",
        reason: "Employee data has been successfully updated!",
      };
      return result;
    */
  };

  let res = await updateEmployees(mainTaskName, employerName, workerArray);

  // send main task to employers > employerName > tasks
  await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .set(taskData);
  result = { status: "success", reason: mainTaskName + " has been created!" };
  console.log(result);
  return result;
};;;

// Function to update sub tasks for employees in employees > tasks > sub tasks
// Currently not exported
createEmployeeSubTask = async (
  employeeName,
  mainTaskName,
  subTaskName,
  taskData
) => {
  employeeRef = db.collection("employees").doc(employeeName);
  let employeesnapshot = await employeeRef.get();
  if (!employeesnapshot.exists) {
    result = {
      status: "error",
      reason: employeeName + " was not found! Try checking your spelling!",
    };
    console.log(result);
    return result;
  }

  taskRef = employeeRef
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .doc(subTaskName);
  await taskRef.set(taskData);
  result = {
    status: "success",
    reason: subTaskName + " was successfully assigned to " + employeeName,
  };
  console.log(result);
  return result;
};

createSubTask = async (
  subTaskName,
  subTaskDesc,
  goal,
  mainTaskName,
  employerName,
  workerArray
) => {
  let taskData = {
    description: subTaskDesc,
    workers: workerArray,
    goal: goal,
    progress: 0,
    status: "in progress",
  };

  // update employees database to track what they are currently working on
  updateEmployees = async (
    subTaskName,
    mainTaskName,
    employerName,
    workerArray
  ) => {
    console.log(workerArray);
    for (i = 0; i < workerArray.length; i++) {
      employeeName = workerArray[i];
      // check if the employee is under that employer, if not return error status
      docRef = db
        .collection("employers")
        .doc(employerName)
        .collection("employees")
        .doc(employeeName);
      console.log(employeeName);
      let snapshot = await docRef.get();
      if (!snapshot.exists) {
        // if the doc doesnt exist
        result = {
          status: "error",
          reason:
            "No employee named" +
            employeeName +
            "were found under employer" +
            employerName +
            "! Try checking your spelling!",
        };
        console.log(result);
        return result;
      }

      let res = await createEmployeeSubTask(
        employeeName,
        mainTaskName,
        subTaskName,
        taskData
      );
      if (res.status == "error") {
        console.log(res);
        return res;
      }

      // Currently unneeded due to reformatting of database
      // employeeRef = db.collection("employees").doc(employeeName);
      // if (doc.data().currentTask.mainTasks.find(element => element.name == mainTaskName) == undefined) {  // Employee has not been assigned the correct main task
      //   result = {status: 'error', reason: 'Employee has not been assigned the main task: ' + mainTaskName + '!'};
      //   return result;
      // }
      // data = doc.data().currentTask.mainTasks.find(element => element.name == mainTaskName);
      // data.subTasks.push(subTaskName);

      // employeeRef.update({
      //   currentTask: data,
      // });
      // docRef.update({
      //   currentTask: data,
      // });

      /*    result = {
                                                 status: "success",
                                                 reason:
                                                   "Employee data has been successfully updated!",
                                               };
                                               return result;*/
    }
  };

  let res = await updateEmployees(
    subTaskName,
    mainTaskName,
    employerName,
    workerArray
  );

  await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .doc(subTaskName)
    .set(taskData);
  result = {
    status: "success",
    reason: subTaskName + " has been created under" + mainTaskName,
  };
  console.log(result);
  return result;
};

mainTaskProgress = async (mainTaskName, employerName) => {
  // find progress/per goal of all subtasks and then find the %
  // jiayou
  let mainTaskProgress = "0";
  var subTaskProgress = 0;
  var subTaskCounter = 0;
  const snapshot = await db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .get();
  if (snapshot.empty) {
    result = {
      status: "success",
      reason: "There were no subtasks under " + mainTaskName,
      body: mainTaskProgress,
    };
    return result;
  }
  snapshot.forEach((doc) => {
    console.log(doc.data().status);
    if (doc.data().status == "finished") {
      subTaskProgress += 1;
      subTaskCounter += 1;
    } else {
      subTaskProgress += doc.data().progress / doc.data().goal;
      subTaskCounter += 1;
    }
  });
  // console.log(subTaskProgress);
  //console.log(subTaskCounter);
  mainTaskProgress = (subTaskProgress / subTaskCounter).toString();
  if (mainTaskProgress === "0") {
    mainTaskProgress = "0";
  }
  result = {
    status: "success",
    reason: "the progress of the main task is:" + mainTaskProgress,
    body: mainTaskProgress,
  };
  return result;
};

// Employer Side
completeMainTask = async (mainTaskName, employerName) => {
  mainTaskRef = db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName);
  let doc = await mainTaskRef.get();
  if (!doc.exists) {
    result = {
      status: "error",
      reason: mainTaskName + " does not exist! Try checking your spelling",
    };
    console.log(result);
    return result;
  }

  // complete all of the subtasks of the main task
  const snapshot = await mainTaskRef.collection("subtasks").get();
  /*if (snapshot.empty) {
    result = {
      status: "error",
      reason: mainTaskName + "does not have any subtask!",
    };
    return result;
  }
  */
  snapshot.forEach((doc) => {
    doc.ref.update({
      status: "finished",
      progress: doc.data().goal,
    });
  });

  // complete all of the subtasks in the employees collection
  // Function given an employee name, progress and status will update the employees task record
  updateEmployee = async (employeeName, mainTaskName) => {
    employeeTaskRef = db
      .collection("employees")
      .doc(employeeName)
      .collection("tasks")
      .doc(mainTaskName);

    const snap = await employeeTaskRef.collection("subtasks").get();
    count = 0;
    snap.forEach((subtasks) => {
      subtasks.ref.update({
        status: "finished",
        progress: subtasks.data().goal,
      });
      count += 1;
    });
    employeeTaskRef.update({
      status: "finished",
    });
    if (count == snap.size) {
      result = {
        status: "success",
        reason: "All subtasks under " + employeeName + " have been completed!",
      };
      return result;
    }
  };

  counter = 0;
  for (i = 0; i < doc.data().workers.length; ++i) {
    employeeName = doc.data().workers[i];
    console.log(employeeName);
    await updateEmployee(employeeName, mainTaskName);
    counter += 1;
  }

  // complete the main task
  mainTaskRef.update({
    status: "finished",
  });

  if (counter == doc.data().workers.length) {
    result = {
      status: "success",
      reason: mainTaskName + " has been completed!",
    };
    console.log(result);
    return result;
  }
};

// Employer side
completeSubTask = async (subTaskName, mainTaskName, employerName) => {
                                                                       subTaskRef = db
                                                                         .collection(
                                                                           "employers"
                                                                         )
                                                                         .doc(
                                                                           employerName
                                                                         )
                                                                         .collection(
                                                                           "tasks"
                                                                         )
                                                                         .doc(
                                                                           mainTaskName
                                                                         )
                                                                         .collection(
                                                                           "subtasks"
                                                                         )
                                                                         .doc(
                                                                           subTaskName
                                                                         );
                                                                       const doc = await subTaskRef.get();
                                                                       if (
                                                                         !doc.exists
                                                                       ) {
                                                                         result = {
                                                                           status:
                                                                             "error",
                                                                           reason:
                                                                             subtaskName +
                                                                             " does not exist! Try checking your spelling!",
                                                                         };
                                                                         return result;
                                                                       }
                                                                       subTaskRef.update(
                                                                         {
                                                                           progress: doc.data()
                                                                             .goal,
                                                                           status:
                                                                             "finished",
                                                                         }
                                                                       );

                                                                       // complete all of the subtasks in the employees collection
                                                                       // Function given an employee name, progress and status will update the employees task record
                                                                       updateEmployee = async (
                                                                         employeeName,
                                                                         subTaskName,
                                                                         mainTaskName
                                                                       ) => {
                                                                         employeeSubTaskRef = db
                                                                           .collection(
                                                                             "employees"
                                                                           )
                                                                           .doc(
                                                                             employeeName
                                                                           )
                                                                           .collection(
                                                                             "tasks"
                                                                           )
                                                                           .doc(
                                                                             mainTaskName
                                                                           )
                                                                           .collection(
                                                                             "subtasks"
                                                                           )
                                                                           .doc(
                                                                             subTaskName
                                                                           );
                                                                         const subTask = await employeeSubTaskRef.get();
                                                                         console.log(
                                                                           subTask
                                                                         );
                                                                         employeeSubTaskRef
                                                                           .update(
                                                                             {
                                                                               progress: subTask.data()
                                                                                 .goal,
                                                                               status:
                                                                                 "finished",
                                                                             }
                                                                           )
                                                                           .then(
                                                                             () => {
                                                                               result = {
                                                                                 status:
                                                                                   "success",
                                                                                 reason:
                                                                                   "All subtasks under " +
                                                                                   employeeName +
                                                                                   " have been completed!",
                                                                               };
                                                                               return result;
                                                                             }
                                                                           );
                                                                       };

                                                                       counter = 0;
                                                                       for (
                                                                         i = 0;
                                                                         i <
                                                                         doc.data()
                                                                           .workers
                                                                           .length;
                                                                         ++i
                                                                       ) {
                                                                         employeeName = doc.data()
                                                                           .workers[
                                                                           i
                                                                         ];
                                                                         await updateEmployee(
                                                                           employeeName,
                                                                           subTaskName,
                                                                           mainTaskName
                                                                         );
                                                                         counter += 1;
                                                                       }

                                                                       if (
                                                                         counter ==
                                                                         doc.data()
                                                                           .workers
                                                                           .length
                                                                       ) {
                                                                         result = {
                                                                           status:
                                                                             "success",
                                                                           reason:
                                                                             subTaskName +
                                                                             " has been completed!",
                                                                         };
                                                                         return result;
                                                                       }
                                                                     };
// Function to increase the progress of a subtask
// If new value >= goal, instantly complete the subtask
// Function to increase the progress of a subtask
// If new value >= goal, instantly complete the subtask
// Employer Side
progressSubTask = async (subTaskName, value, mainTaskName, employerName) => {
                                                                             subTaskRef = db
                                                                               .collection(
                                                                                 "employers"
                                                                               )
                                                                               .doc(
                                                                                 employerName
                                                                               )
                                                                               .collection(
                                                                                 "tasks"
                                                                               )
                                                                               .doc(
                                                                                 mainTaskName
                                                                               )
                                                                               .collection(
                                                                                 "subtasks"
                                                                               )
                                                                               .doc(
                                                                                 subTaskName
                                                                               );
                                                                              console.log(
                                                                                employerName
                                                                              );
                                                                              console.log(
                                                                                mainTaskName
                                                                              );
                                                                              console.log(
                                                                                subTaskName
                                                                              );

                                                                              let subTaskProgress = 0;
                                                                              let subTaskGoal = 0;
                                                                              let doc = await subTaskRef.get();
                                                                              if (
                                                                                !doc.exists
                                                                              ) {
                                                                                result = {
                                                                                  status:
                                                                                    "error",
                                                                                  reason:
                                                                                    subTaskName +
                                                                                    " does not exist! Try checking your spelling!",
                                                                                };
                                                                                console.log(
                                                                                  result
                                                                                );
                                                                                return result;
                                                                              }
                                                                              console.log(
                                                                                doc.data()
                                                                              );
                                                                              subTaskProgress = doc.data()
                                                                                .progress;
                                                                              subTaskGoal = doc.data()
                                                                                .goal;
                                                                              let newvalue = Number(
                                                                                value
                                                                              );
                                                                              employeeArr = doc.data()
                                                                                .workers;

                                                                              // Function given an employee name, progress and status will update the employees task record
                                                                              updateEmployee = async (
                                                                                employeeName,
                                                                                progress,
                                                                                status,
                                                                                subTaskName,
                                                                                mainTaskName
                                                                              ) => {
                                                                                employeeSubTaskRef = db
                                                                                  .collection(
                                                                                    "employees"
                                                                                  )
                                                                                  .doc(
                                                                                    employeeName
                                                                                  )
                                                                                  .collection(
                                                                                    "tasks"
                                                                                  )
                                                                                  .doc(
                                                                                    mainTaskName
                                                                                  )
                                                                                  .collection(
                                                                                    "subtasks"
                                                                                  )
                                                                                  .doc(
                                                                                    subTaskName
                                                                                  );
                                                                                dataObj = {
                                                                                  progress: progress,
                                                                                  status: status,
                                                                                };
                                                                                employeeSubTaskRef
                                                                                  .update(
                                                                                    {
                                                                                      progress: progress,
                                                                                      status: status,
                                                                                    }
                                                                                  )
                                                                                  .then(
                                                                                    () => {
                                                                                      return {
                                                                                        status:
                                                                                          "success",
                                                                                        reason:
                                                                                          "Employee data has been successfully updated!",
                                                                                      };
                                                                                    }
                                                                                  );
                                                                              };

                                                                              if (
                                                                                subTaskProgress +
                                                                                  newvalue >=
                                                                                subTaskGoal
                                                                              ) {
                                                                                subTaskStatus =
                                                                                  "finished";
                                                                                subTaskRef.update(
                                                                                  {
                                                                                    progress: subTaskGoal,
                                                                                    status: subTaskStatus,
                                                                                  }
                                                                                );
                                                                                //update employees
                                                                                for (
                                                                                  i = 0;
                                                                                  i <
                                                                                  employeeArr.length;
                                                                                  ++i
                                                                                ) {
                                                                                  await updateEmployee(
                                                                                    employeeArr[
                                                                                      i
                                                                                    ],
                                                                                    subTaskProgress +
                                                                                      newvalue,
                                                                                    subTaskStatus,
                                                                                    subTaskName,
                                                                                    mainTaskName
                                                                                  );
                                                                                }
                                                                              } else {
                                                                                subTaskStatus =
                                                                                  "in progress";
                                                                                subTaskRef.update(
                                                                                  {
                                                                                    progress:
                                                                                      subTaskProgress +
                                                                                      newvalue,
                                                                                  }
                                                                                );
                                                                                // update employees
                                                                                for (
                                                                                  i = 0;
                                                                                  i <
                                                                                  employeeArr.length;
                                                                                  ++i
                                                                                ) {
                                                                                  console.log(
                                                                                    employeeArr[
                                                                                      i
                                                                                    ]
                                                                                  );
                                                                                  await updateEmployee(
                                                                                    employeeArr[
                                                                                      i
                                                                                    ],
                                                                                    subTaskProgress +
                                                                                      newvalue,
                                                                                    subTaskStatus,
                                                                                    subTaskName,
                                                                                    mainTaskName
                                                                                  );
                                                                                }
                                                                              }
                                                                              result = {
                                                                                status:
                                                                                  "success",
                                                                                reason:
                                                                                  subTaskName +
                                                                                  " has been progressed!",
                                                                              };
                                                                              return result;
                                                                            };

// Function for employee to progress the subtask they are currently working on
progressSubTaskEmployee = async (
  subTaskName,
  value,
  mainTaskName,
  employeeName
) => {
  // Check to see if the employee is currently working on the subtask
  employeeSubTaskRef = db
    .collection("employees")
    .doc(employeeName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("subtasks")
    .doc(subTaskName);
  let employeeCheck = await employeeSubTaskRef.get();
  if (!employeeCheck.exists) {
    result = {
      status: "error",
      reason: employeeName + " is not assigned to this task!",
    };
    return result;
  }

  // Get employee's secret code
  employeeRef = db.collection("employees").doc(employeeName);
  let doc = await employeeRef.get();
  employeeCode = doc.data().secretcode;
  const employerName = await findEmployer(employeeCode);
  this.progressSubTask(subTaskName, value, mainTaskName, employerName).then(
    (result) => {
      return result;
    }
  );
};

module.exports = {
  createMainTask,
  createSubTask,
  completeMainTask,
  completeSubTask,
  mainTaskProgress,
  progressSubTask,
  progressSubTaskEmployee,
};
