const nodemailer = require('nodemailer');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Application Status Email Notification Function
const sendStatusEmail = async (userEmail, userName, newStatus, uniName) => {
  try {
    const isAccepted = String(newStatus).toLowerCase() === 'accepted';
    const formattedStatus = String(newStatus).replace('_', ' ').toUpperCase();
    
    const mailOptions = {
      from: `"Study Abroad Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Application Status Update: ${uniName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #16202E; border: 1px solid #E7EAEF; border-radius: 10px;">
          <h2>Dear ${userName || 'Student'},</h2>
          <p>Your application status for <strong>${uniName}</strong> has been updated.</p>
          <p style="font-size: 16px;">
            New Status: 
            <span style="font-weight: bold; color: ${isAccepted ? '#16a34a' : '#2563eb'}; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;">
              ${formattedStatus}
            </span>
          </p>
          <p>Please log in to your dashboard to view the full details of your application.</p>
          <br />
          <p>Best regards,<br><strong>Study Abroad Portal Team</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Status email successfully sent to ${userEmail} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error('Error sending status email:', error.message);
    throw error;
  }
};

sendStatusEmail.sendStatusEmail = sendStatusEmail;
module.exports = sendStatusEmail;