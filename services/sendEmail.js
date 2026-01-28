const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// optional but recommended 
transporter.verify((error, success) => {
  if (error) {
    console.log(" Email config error:", error);
  } else {
    console.log(" Email server ready");
  }
});

exports.sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `" CodeKart Software Pvt.Ltd " <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Login OTP",
    html: `
      <h2>Your OTP is ${otp}</h2>
      <p>Valid for 5 minutes</p>
    `,
  });
};

exports.sendAbsentEmail = async (to, name, date) => {
  await transporter.sendMail({
    from: `"School App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Attendance Alert",
    html: `
      <h2>Hello ${name}</h2>
      <p>You were marked <b style="color:red;">ABSENT</b> on <b>${date}</b>.</p>
      <p>Please contact the school if this is incorrect.</p>
    `,
  });
};

