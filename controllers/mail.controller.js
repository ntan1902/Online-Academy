const mail = {}
const nodemailer = require("nodemailer");

require('dotenv').config();
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

mail.send = function (email, link) {
    mailOptions = {
        from: process.env.USER,
        to: email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    }
    return smtpTransport.sendMail(mailOptions);
}

module.exports = mail;