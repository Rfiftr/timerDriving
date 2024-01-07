let userData = localStorage.getItem("user") || null

const container = document.querySelector(".container");
const buttonStart = document.querySelector("#start-button");
const buttonStop = document.querySelector("#stop-button")
const inputDriver = document.querySelector("#else-driver-name");
const errorsShow = document.querySelector("#error-show");
const downloadButton = document.querySelector("#download-button");
const formLoginContainer = document.querySelector("#form-login")
const loginButton = document.querySelector("#login-button");
const addUserButton = document.querySelector("#add-user");
const nameUserInput = document.querySelector("#formNameInput");
const phoneUserInput = document.querySelector("#formPhoneInput");
const closeFormButton = document.querySelector("#close-form");



const url = window.location.origin;

loginButton.addEventListener('click', showLoginForm)
downloadButton.addEventListener('click', downloadData);
closeFormButton.addEventListener('click', () => {
    formLoginContainer.style.display = 'none';
    container.style.display = 'block'
})
addUserButton.addEventListener('click', sendVerificationCode)
window.addEventListener('load', () => {
    isRegistered()
})



function showLoginForm() {
    formLoginContainer.style.display = "block";
    container.style.display = 'none'
}



/**
 * יצירת משתמש
 */
async function sendVerificationCode() {
    const nameUser = nameUserInput.value;
    const phoneUser = `+972${phoneUserInput.value}`;
    

    const response = await fetch(`${url}/send-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameUser, phone: phoneUser }),
    })

    const result = await response.json();
    showSuccessMessage(result.message, result.success)

    if(result.success) {
        document.querySelector("#verificationCodeSection").style.display = 'block';
    }
}


/**
 * verify user
 */
async function verifyCode() {
    const nameUser = nameUserInput.value;
    const phoneUser = `+972${phoneUserInput.value}`;
    const verificationCode = document.getElementById("verificationCodeInput").value;
    const response = await fetch(`${url}/verify-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameUser, phone: phoneUser, code: verificationCode }),
    });

    const result = await response.json();
    showSuccessMessage(result.message, result.success)

    console.log('Sent data:', JSON.stringify({ name: nameUser, phone: phoneUser, code: verificationCode }));

    if (result.success) {
        formLoginContainer.style.display = 'none';
        loginButton.style.display = 'none';
        container.style.display = 'block';

        const user = {
            name: nameUser,
            phone: phoneUser,
        };

        localStorage.setItem("user", JSON.stringify(user))
        userData = user;

    }
}

 

/**
 * Download the data file from the server
 */
function downloadData() {
    if(isRegistered()) {
        const downloadLink = document.createElement("a")
        downloadLink.href = "/downloadTextFile";
        downloadLink.download = "data.txt";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    
        document.body.removeChild(downloadLink);
    } else {
        errorsShow.textContent = "עליך להירשם קודם"
    }

}


function isRegistered() {
    if (userData) {
        loginButton.style.display = 'none'
        return true
    } else {
        loginButton.style.display = 'block'
        return false
    }
}



let driverName;

inputDriver.addEventListener('input', hiddenError)

function hiddenError() {
    errorsShow.textContent = ""
}


function selectDriver(nameDriver) {
    if(isRegistered()) {
        hiddenError()
        driverName = nameDriver;
    } else {
        errorsShow.textContent = "עליך להירשם קודם"
    }
}



/**
 * Enters the driver's name, 
 * and the date of the start of the trip
 */
function startTrip() {
    let status = "מתחיל נסיעה"
    if(driverName) {
        addDataToFile(status)
    } else if(inputDriver.value.length > 1) {
        driverName = inputDriver.value;
        addDataToFile(status)
    } else {
        errorsShow.textContent = "בחר נהג או הכנס שם"
    }
}


/**
 * Enters the driver's name,
 * and the date of the end of the trip
 */
function stopTrip() {
    let status = "מסיים נסיעה"
    if(driverName) {
        addDataToFile(status)
    } else if(inputDriver.value.length > 1) {
        driverName = inputDriver.value;
        addDataToFile(status)
    } else {
        errorsShow.textContent = "בחר נהג או הכנס שם"
    }
}

/**
 * Adds the data to the data.txt file
 * @param {*the state of travel} status 
 */
async function addDataToFile(status) {
    data = `{
    שם הנהג: ${driverName}
    סטטוס הנהיגה: ${status}
    ${getTime()}
    נתוני אימות משתמש: ${userData}
}`

    try {
        const response = await fetch(`${url}/addData`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data })
        });

        if(!response.ok) {
            showSuccessMessage("נכשל! נסה שוב", false)
            throw new Error('Network response was not ok')
        }

        showSuccessMessage("נוסף בהצלחה!", true)
    } catch (err) {
        console.error("Error from js addData" + err)
    }
    driverName = null
    inputDriver.value = ""
}


/**
 * Generates a string that contains a date and time
 * @returns Date and time in string
 */
function getTime() {
    let date = new Date()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let second = date.getSeconds()
    const formatDate = `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} זמן: ${hours}:${minutes}:${second}`;

    return formatDate;
}


/**
 * Shows appropriate message depending on success or not
 * @param {*} message Appropriate message
 * @param {*} isSuccess whether he succeeded or not
 */
function showSuccessMessage(message, isSuccess) {
    const successMessageContainer = document.querySelector("#successMessageContainer")
    const messageText = document.querySelector("#messageText");

    messageText.innerHTML = message;
    successMessageContainer.classList.remove("hidden");

    if(isSuccess) {
        successMessageContainer.classList.add("successMessage")
        setTimeout(function() {
            successMessageContainer.classList.add("hidden");
            successMessageContainer.classList.remove("successMessage")

        }, 3000);
    }

    if(!isSuccess) {
        successMessageContainer.classList.add("errorMessage")
        setTimeout(function() {
            successMessageContainer.classList.add("hidden");
            successMessageContainer.classList.remove("errorMessage")

        }, 3000);
    }
}