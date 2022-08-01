const express = require("express");
const app = express();
const cors = require("cors");
var admin = require("firebase-admin");
const path = require("node:path");
var serviceAccount = require("./service-account-file.json");
admin.initializeApp({
  // make sure to put the initialize before any of the functions i sent you
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://businessaide.firebaseio.com",
});
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.use(express.static(path.join(__dirname + "/public")));
// app.use(cors({
//   origin: '*'
// }));

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

var retriever = require("./retriever");
var task = require("./task");
var sender = require("./sender");
var feedback = require("./feedback")

app.use(cors(corsOptions)); // Use this after the variable declaration
app.get("/getEmployee", (req, res) => {
  retriever.getEmployeeData(req.query.name).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/createMainTask", async (req, res) => {
                                                 console.log(
                                                   req.query.taskname
                                                 );
                                                 console.log(
                                                   req.query.description
                                                 );
                                                 console.log(
                                                   req.query.employer
                                                 );
                                                 console.log(req.query.people);
                                                 workerArr = req.query.people.split(
                                                   ","
                                                 );

                                                 let x = await task.createMainTask(
                                                   req.query.taskname,
                                                   req.query.description,
                                                   req.query.employer,
                                                   workerArr
                                                 );
                                               });

app.get("/createSubTask", async (req, res) => {
  console.log(req.query.subTaskName);
  console.log(req.query.subTaskDesc);
  console.log(req.query.goal);
  console.log(req.query.mainTaskName);
  workerArr = req.query.workerArray.split(",");
  let x = await task.createSubTask(
    req.query.subTaskName,
    req.query.subTaskDesc,
    req.query.goal,
    req.query.mainTaskName,
    req.query.employerName,
    workerArr
  );
});

app.get("/displayTask", async (req, res) => {
  console.log(req.query.employerName);
  retriever.getAllTaskData(req.query.employerName).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/viewMainTaskFeedback", async (req, res) => {
  console.log(req.query.employerName);
  feedback
    .viewMainTaskFeedback(req.query.mainTaskName, req.query.employerName)
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
      res.send(ans);
    });
});
app.get("/displayEmployeeTask", async (req, res) => {
  console.log(req.query.employeeName);
  retriever.getAllEmployeeTaskData(req.query.employeeName).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/getSubTaskData", async (req, res) => {
  console.log(req.query.employerName);
  retriever
    .getSubTaskData(
      req.query.subTaskName,
      req.query.mainTaskName,
      req.query.employerName
    )
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
      res.send(ans);
    });
});

app.get("/getMainTaskData", async (req, res) => {
  retriever
    .getMainTaskData(req.query.mainTaskName, req.query.employerName)
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
      res.send(ans);
    });
});

app.get("/updateSubTaskProgress", async (req, res) => {
  retriever
    .progressSubTask(
      req.query.subTaskName,
      req.query.value,
      req.query.mainTaskName,
      req.query.employerName
    )
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
      res.send(ans);
    });
});

app.get("/mainTaskProgress", async (req, res) => {
  task.mainTaskProgress(req.query.tasks, req.query.employerName).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/subTaskProgress", async (req, res) => {
  task.progressSubTask(
    req.query.subTaskName,
    req.query.value,
    req.query.mainTaskName,
    req.query.employerName
  );
});

app.get("/completeMainTask", async (req, res) => {
  task.completeMainTask(req.query.mainTaskName, req.query.employerName);
});

app.get("/completeSubTask", async (req, res) => {
  task.completeSubTask(
    req.query.subTaskName,
    req.query.mainTaskName,
    req.query.employerName
  );
});

app.get("/sendPayroll", async (req, res) => {
  console.log(req.query.employerName);
  sender
    .sendPayroll(
      req.query.dailySalary,
      req.query.daysAttended,
      req.query.overtimeHourlyRate,
      req.query.overtimeHours,
      req.query.deductions,
      req.query.overallSalary,
      req.query.employeeName,
      req.query.employerName
    )
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
      res.send(ans);
    });
});

app.get("/SendEmployee", async (req, res) => {
  sender
    .sendEmployee(
      req.query.firstName,
      req.query.lastName,
      req.query.secretCode,
      req.query.dob,
      req.query.workExp,
      req.query.location,
      req.query.title,
      req.query.phoneNum,
      req.query.dailySalary,
      req.query.daysAttended,
      req.query.overtimeHourlyRate,
      req.query.overtimeHours,
      req.query.deductions,
      req.query.overallSalary
    )
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
    });
});

app.get("/SendEmployer", async (req, res) => {
  sender
    .sendEmployer(req.query.firstName, req.query.lastName, req.query.secretCode)
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
    });
});

app.get("/sendFeedback", async (req, res) => {
  feedback
    .sendFeedback(
      req.query.employeeName,
      req.query.employerName,
      req.query.feedback,
      req.query.anonymousCheck,
      req.query.mainTaskName
    )
    .then((ans) => {
      // you need the then to wait for the result of the function
      console.log(ans);
    });
});

app.get("/getAllEmployeeSalary", async (req, res) => {
  retriever.getAllEmployeeSalary(req.query.employerName).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/findUserType", async (req, res) => {
  retriever.findUserType(req.query.email).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

app.get("/getEmployerName", async (req, res) => {
  retriever.getEmployerName(req.query.employeeName).then((ans) => {
    // you need the then to wait for the result of the function
    console.log(ans);
    res.send(ans);
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
