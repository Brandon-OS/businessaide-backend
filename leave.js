// Module to handle leave system for application
// Employees can apply for leave which will notify employers regarding their leave application
// Employers will be able to accept or reject their leave application of their employees

// Function for employees to apply for leave
// Update employees and employers database
applyForLeave = async(employeeName, employerName, date, duration, reason) => {
    const employeeLeaveRef = db.collection('employees').doc(employeeName).collection('leave').doc(date);
    const employerLeaveRef = db.collection('employers').doc(employerName).collection('employees').doc(employeeName).collection('leave').doc(date);
    const employeeLeaveDoc = await employeeLeaveRef.get();
    const employerLeaveDoc = await employerLeaveRef.get();
    if (!employeeLeaveDoc.exists || !employerLeaveDoc.exists) {
        const result = {status: 'error', reason: employeeName + ' already has an application for leave on that date'};
        return result;
    } else {
        if (!this.checkLeaveQuota(employeeName, duration)) {
            const result = {status: 'error', reason: employeeName + ' does not have enough leave quota!'};
            return result;
        }
        const data = {
            employeeName: employeeName,
            date: date,
            duration: duration,
            reason: reason,
            status: 'pending'
        };
        await employeeLeaveRef.set(data);
        await employerLeaveRef.set(data);
        const result = {status: 'success', reason: 'Leave application has been sent successfully'};
        return result;
    }
}

// Function to notify employers if there is an employee applying to leave
// returns true if there is an application
notifyEmployer = async(employerName) => {
    const employerRef = db.collection('employers').doc(employerName).collection('employees');
    const snapshot = await employerRef.get();
    if (!snapshot.empty) {
        const result = {status: 'error', reason: employerName + ' does not have any employees!', body: 'no employee'};
        return result;
    }
    check = async(snapshot) => {
        let result = snapshot.forEach(employee => {
            const snappy = await employee.ref.collection('leave').get();
            if (snappy.empty) {
                const result = {status: 'success', reason: 'no employees have applied for leave', body: false};
                return result;
            } else {
                const result = {status: 'success', reason: 'some employees have applied for leave', body: true};
                return result;
            }
        })
        return result;
    }

    const result = await check(snapshot);
    return result;
}

// Function that returns an array of objects containing the leave applications of employees
// Gets the all leave applications of a certain status (pending, accepted, rejected)
getLeaveByType = async(employerName, status) => {
    const employerRef = db.collection('employers').doc(employerName).collection('employees');
    const snapshot = await employerRef.get();
    if (!snapshot.empty) {
        const result = {status: 'error', reason: employerName + ' does not have any employees!', body: 'no employee'};
        return result;
    }
    find = async(snapshot) => {
        leaveArr = [];
        counter = 0;
        let tempResult = snapshot.forEach(employee => {
            const snappy = await employee.ref.collection('leave').where('status','==', status).get();
            if (snappy.empty) {
                const result = {status: 'success', reason: 'There are no leave requests of that type', body: []};
                return result;
            } else {
                leaveArr.push(employee);
            }
            counter += 1;
        })
        if (counter == snapshot.size) {
            const result = {status: 'success', reason: 'All leave requests have been compiled', body: leaveArr};
            return result;
        }
        if (tempResult.body == []){
            return tempResult;
        }
    }
    const result = await find(snapshot);
    return result;  
}

// Function for employers to accept an employee's application for leave
acceptLeave = async(employeeName, employerName, date) => {
    const employeeLeaveRef = db.collection('employees').doc(employeeName).collection('leave').doc(date);
    employeeLeaveDoc = await employeeLeaveRef.get();
    if (!employeeLeaveDoc.exists) {
        const result = {status: 'error', reason: 'This employee does not have any leave applications on that date!'};
        return result;
    }

    await employeeLeaveRef.update({
        status: 'accepted'
    })

    // update employer side
    const employerLeaveRef = db.collection('employers/' + employerName + '/employees/' + employeeName + '/leave');
    await employerLeaveRef.update({
        status: 'accepted'
    })
    await this.reduceLeaveQuota(employeeName, employeeDoc.data().duration);
    const result = {status: 'success', reason: "This employee's leave application has been accepted!"};
    return result;
}

// Function for employers to accept an employee's application for leave
rejectLeave = async(employeeName, employerName, date) => {
    const employeeLeaveRef = db.collection('employees').doc(employeeName).collection('leave').doc(date);
    employeeLeaveDoc = await employeeLeaveRef.get();
    if (!employeeLeaveDoc.exists) {
        const result = {status: 'error', reason: 'This employee does not have any leave applications on that date!'};
        return result;
    }

    await employeeLeaveRef.update({
        status: 'rejected'
    })

    // update employer side
    const employerLeaveRef = db.collection('employers/' + employerName + '/employees/' + employeeName + '/leave');
    await employerLeaveRef.update({
        status: 'rejected'
    })

    const result = {status: 'success', reason: "This employee's leave application has been rejected!"};
    return result;
}

// Function to view requests of a certain type (pending, accepted, rejected)
// Employee side
viewLeaveRequestsByType = async(employeeName, status) => {
    const employeeLeaveRef = db.collection('employees/' + employeeName + '/leave');
    const snapshot = await employeeLeaveRef.where('status', '==', status).get();
    if (snapshot.empty) {
        const result = {status: 'error', reason: "This employee does not have any leave applications of that status!", body: []};
        return result;
    }

    leaveArr = [];

    assign = async(snapshot, leaveArr) => {
        counter = 0;
        snapshot.forEach(applications => {
            leaveArr.push(applications);
            counter += 1;
        })
        if (snapshot.size == counter) {
            return leaveArr;
        }
    }

    leaveArr = await assign(snapshot, leaveArr);
    if (leaveArr.length = snapshot.size) {
        const result = {status: 'success', reason: "The leave requests of this employee has been compiled", body: leaveArr};
        return result;
    }
}

// Function to view requests of all types
// Employee side
viewAllLeaveRequests = async(employeeName) => {
    const employeeLeaveRef = db.collection('employees/' + employeeName + '/leave');
    const snapshot = await employeeLeaveRef.get();
    if (snapshot.empty) {
        const result = {status: 'error', reason: "This employee does not have any leave applications of that status!", body: []};
        return result;
    }

    leaveArr = [];

    assign = async(snapshot, leaveArr) => {
        counter = 0;
        snapshot.forEach(applications => {
            leaveArr.push(applications);
            counter += 1;
        })
        if (snapshot.size == counter) {
            return leaveArr;
        }
    }

    leaveArr = await assign(snapshot, leaveArr);
    if (leaveArr.length = snapshot.size) {
        const result = {status: 'success', reason: "The leave requests of this employee has been compiled", body: leaveArr};
        return result;
    }
}

// Function to check leave quota
// If less than the required amount, returns 1, else, return 0
// WILL NOT BE EXPORTED
checkLeaveQuota = async(employeeName, employerName, value) => {
    const employeeRef = db.collection('employees/' + employeeName);
    employeeDoc = await employeeRef.get();
    const leaveQuota = employeeDoc.data().leaveQuota;
    if (leaveQuota >= value) {
        return 0;
    } else {
        return 1;
    }
}

// Function to reduce leave quota by a certain amount
// Returns 0 if successfully returned, 1 if not
// WILL NOT BE EXPORTED
reduceLeaveQuota = async(employeeName, value) => {
    const employeeRef = db.collection('employees/' + employeeName);
    const employerRef = db.collection('employers/' + employerName + '/employees/' + employeeName);
    employeeDoc = await employeeRef.get();
    const leaveQuota = employeeDoc.data().leaveQuota;
    if (!checkLeaveQuota(employeeName, value)) {
        await employeeRef.update({
            leaveQuota: leaveQuota - value
        });
        await employerRef.update({
            leaveQuota: leaveQuota - value
        });
        return 0;
    } else {
        return 1;
    }
}

// Function to change leave quota for a single employee
changeSingleQuota = (employeeName, value) => {
    const employeeRef = db.collection('employees/' + employeeName);
    const employerRef = db.collection('employers/' + employerName + '/employees/' + employeeName);
    await employeeRef.update({
        leaveQuota: value
    })
    await employerRef.update({
        leaveQuota: value
    })
    const result = {status: 'success', reason: "The quota of " +employeeName + ' has ben changed!'};
    return result;
}

// Function to change leave quota for all employees
changeAllQuota = async(employerName, value) => {
    const employerRef = db.collection('employers/' + employerName + '/employees');
    const snapshot = await employerRef.get();
    if (snapshot.empty) {
        const result = {status: 'error', reason: "This employer does not have any employees under him!"};
        return result;
    }
    // change employee side
    assignEmployees = async(employeeName, value) => {
        const employeeRef = db.collection('employees/' + employeeName);
        await employeeRef.update({
            leaveQuota: value
        });
        return 0;
    }

    counter = 0;
    snapshot.forEach(async(employees) => {
        await assignEmployees(employees.id, value);
        counter += 1;
    })

    if (counter == snapshot.size) {
        const result = {status: 'success', reason: "All employee leave quotas have been changed!"};
        return result;
    }
}

//!TODO Update all functions above acceptLeave to feature leave quota
module.exports = {applyForLeave, notifyEmployer, getLeaveByType, acceptLeave, rejectLeave, viewAllLeaveRequests, viewLeaveRequestsByType, checkLeaveQuota, reduceLeaveQuota, changeAllQuota, changeSingleQuota};

