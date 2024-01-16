const nodemailer = require('nodemailer');

// Middleware for sending emails using Gmail SMTP
const emailMiddleware = (req, res, next) => {
  // Replace with your Gmail SMTP credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'moolchandsaini045@gmail.com',
      pass: 'dvdb tkwn btth llqi',
    },
  });

  // Function to send an email
  const sendEmail = async (mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Attach the sendEmail function to the response object
  res.sendEmail = sendEmail;

  // Continue with the next middleware or route handler
  next();
};

module.exports = emailMiddleware;
