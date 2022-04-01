const express = require('express')
const app = express()
const path = require('path');
const cp = require('child_process');
const nodemailer = require("nodemailer");
let PORT = process.env.PORT || 3000;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "charu.messi.ab@gmail.com", // generated ethereal user
    pass: "avbgxfjsgdyobvzr", // generated ethereal password
  },
});

app.get('/', function (req, res) {
  let pathofindexfile = path.join(__dirname, 'index.html');
  res.sendFile(pathofindexfile)
})

app.get('/details/:pin/:age/:email',async function(req, res){
  let pin = req.params.pin;
  let age = req.params.age;
  // console.log(age);
  let email = req.params.email;
  let arr = cp.execSync(`node script ${pin} ${age}`) 
  // console.log(arr+" ")
res.send(arr);
let info = await transporter.sendMail({
  from: '"Atharv Bhandari"<charu.messi.ab@gmail.com>', // sender address
  to: `${email}`, // list of receivers
  subject: "Fight Against Covid", // Subject line
  html: "<b>Schedule Of Vaccination</b>", // html body
  attachments:[{path:"./Schedule.xlsx"}]  
});

console.log("Message sent: %s", info.messageId);
})

app.listen(PORT, function(req, res){
  console.log("server is running");
})

