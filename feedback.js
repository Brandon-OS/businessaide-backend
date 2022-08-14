// Module to handle all functions for the feedback system of BusinessAide
var admin = require("firebase-admin");
const { snapshotEqual } = require("firebase/firestore");
const db = admin.firestore();

// All feedback to be stored in employer > tasks > feedback

// Function to store employee feedback
sendFeedback = async (
  employeeName,
  employerName,
  feedback,
  anonymousCheck,
  mainTaskName
) => {
  const feedbackRef = db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("feedback");

  // check if the employee is under that employer, if not return error status
  docRef = db
    .collection("employers")
    .doc(employerName)
    .collection("employees")
    .doc(employeeName);
  let doc = await docRef.get();
  console.log(employeeName);
  console.log(employerName);
  console.log(feedback);
  console.log(mainTaskName);
  console.log(anonymousCheck);
  if (!doc.exists) {
    result = {
      status: "error",
      reason:
        "No employee named" +
        employeeName +
        "were found under employer " +
        employerName +
        "!",
    };
    console.log(result);
    return result;
  }

  assign = (feedback, anonymousCheck, employeeName) => {
    if (anonymousCheck != "false") {
      // if the employee wishes to be anonymous
      feedbackData = {
        feedback: feedback,
        employee: "anonymous",
      };
      return feedbackData;
    } else {
      feedbackData = {
        // if the employee does not wish to be anonymous
        feedback: feedback,
        employee: employeeName,
      };
      return feedbackData;
    }
  };

  let data = await assign(feedback, anonymousCheck, employeeName);

  // send feedback to employees collection
  const employeeFeedbackRef = db
    .collection("employees")
    .doc(employeeName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("feedback");
  await employeeFeedbackRef.doc("feedback").set(data);
  await feedbackRef.add(data);
  result = {
    status: "success",
    reason: "Feedback has been sent successfully!",
  };
  console.log(result);
  return result;
 
};

// Function that returns an array of objects containing the feedback of a main task
// For the employer to view the feedback of a single main task
// Function that returns an array of objects containing the feedback of a main task
// For the employer to view the feedback of a single main task
viewMainTaskFeedback = async (mainTaskName, employerName) => {
  const feedbackRef = db
    .collection("employers")
    .doc(employerName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("feedback");
  const snapshot = await feedbackRef.get();
  feedbackArr = [];
  if (snapshot.empty) {
    result = {
      status: "success",
      reason: "there is no feedback for this main task at the moment",
      body: [],
    };
    // console.log(result);
    return result;
  }

  assign = async (feedbackArr, doc) => {
    dataObj = {
      feedback: doc.data().feedback,
      employee: doc.data().employee,
    };
    feedbackArr.push(dataObj);
    console.log(feedbackArr);
    return feedbackArr;
  };
  // console.log(snapshot);
  snapshot.forEach(async (doc) => {
    feedbackArr = await assign(feedbackArr, doc);
  });

  if (feedbackArr.length == snapshot.size) {
    result = {
      status: "success",
      reason: "Feedback has been successfully compiled!",
      body: feedbackArr,
    };
    console.log(result);
    return result;
  }
};
// Function for the employee to view their past feedback on a single main task
viewSingleEmployeeFeedback = async (employeeName, mainTaskName) => {
  employeeFeedbackRef = db
    .collection("employee")
    .doc(employeeName)
    .collection("tasks")
    .doc(mainTaskName)
    .collection("feedback");
  const feedback = await employeeFeedbackRef.get();
  if (!feedback.exists) {
    result = {
      status: "error",
      reason: employeeName + " has not left any feedback for this task!",
      body: [],
    };
    return result;
  }

  dataObj = {
    task: mainTaskName,
    feedback: feedback.data().feedback,
  };
  result = {
    status: "success",
    reason: "Feedback has been successfully compiled!",
    body: dataObj,
  };
  return result;
};

// Function to return an array of all of the employees feedback to all main tasks
viewAllEmployeeFeedback = async (employeeName) => {
  employeeFeedbackRef = db
    .collection("employee")
    .doc(employeeName)
    .collection("tasks");
  const tasks = await employeeFeedbackRef.get();
  if (tasks.empty) {
    // Employee has not been assigned tasks and thus is unable to send feedback
    result = {
      status: "error",
      reason: employeeName + " has not been assigned any tasks!",
      body: [],
    };
    return result;
  }

  feedbackArr = [];

  assign = (feedbackArr, doc) => {
    dataObj = {
      feedback: doc.data().feedback,
      employee: doc.data().employee,
    };
    feedbackArr.push(dataObj);
    return feedbackArr;
  };

  tasks.forEach((doc) => {
    let feedbackDoc = doc.ref
      .collection("feedback")
      .doc("feedback")
      .get();
    if (!feedbackDoc.exists) {
      // No feedback for the current task
      return;
    }
    feedbackArr = assign(feedbackArr, feedbackDoc);
  });

  result = {
    status: "success",
    reason: "Feedback has been successfully compiled!",
    body: feedbackArr,
  };
  return result;
};

module.exports = {
  sendFeedback,
  viewMainTaskFeedback,
  viewSingleEmployeeFeedback,
  viewAllEmployeeFeedback,
};
