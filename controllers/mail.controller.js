const nodemailer = require("nodemailer");
require('dotenv').config();
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER, // generated ethereal user
        pass: process.env.PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = smtpTransport;