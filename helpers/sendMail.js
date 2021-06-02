const nodemailer = require('nodemailer');

class SendMail {

    static sendMail(senderMail, subject, content) {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER_NAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: '"CrashFree" <' + process.env.EMAIL_USER_NAME + '>',
            to: senderMail,
            subject: subject,
            html: content
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err);
            else
                console.log(info);
        });
    };
}

module.exports = SendMail;