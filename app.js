const express = require('express');
const fs = require('fs');
const path = require('path')
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const port = 3000;

const accountSid = "ACd25d0bc80b8ce0bb778f1d696dfed12c";
const authToken = "45bb63af4e0c09fa91f81995956783df";
const twilioClient = new twilio(accountSid, authToken);

const verificationCodes = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());




app.post('/send-code', (req, res) => {
    const { name, phone } = req.body;

    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[phone] = verificationCode;

    twilioClient.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: '+12015975929',
        to: phone,
    })
    .then(() => {
        res.json({ success: true, message: 'קוד האימות נשלח בהצלחה' });
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({ success: false, message: 'שגיאה בשליחת קוד אימות' });
    });
});





app.post('/verify-code', (req, res) => {
    const { name, phone, code } = req.body;
    const storedCode = verificationCodes[phone];

    if (storedCode && parseInt(code.trim(), 10) === storedCode) {
        res.json({ success: true, message: 'האימות הצליח. ברוכים הבאים למערכת' });
    } else {
        res.json({ success: false, message: 'קוד אימות לא תקף. אנא בדוק ונסה שוב' });    }
});




app.post("/addData", async (req, res) => {
    const { data } = req.body;
 
    try {
        fs.appendFileSync("data.txt", data + "\n");
        console.log("the line " + data + " added successfully")
        res.status(200).json({ success: true, result: "Update!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, result: "not updated" });
    }
});

app.get('/downloadTextFile', (req, res) => {
    const filePath = path.join(__dirname, 'data.txt')
    const fileName = 'data.txt';

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
