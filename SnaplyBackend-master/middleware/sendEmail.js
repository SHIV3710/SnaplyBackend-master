const nodeMailer = require("nodemailer");

exports.sendEmail = async(options) => {
    
    var transporter = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "cb4ab9ef39fa0d",
          pass: "d7fa60590c62d5",
        }
      });

    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }

    await transporter.sendMail(mailOptions);
}