const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create Mailersend SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mailersend.net',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_SMTP_PASS,
      },
    });
    
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'Leather Pocket Pool League';
  }

  async sendEmail({ to, subject, html, replyTo = null }) {
    try {
      const mailOptions = {
        from: {
          name: this.fromName,
          address: this.fromEmail
        },
        to: to,
        subject: subject,
        html: html
      };

      if (replyTo) {
        mailOptions.replyTo = replyTo;
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendTeamContactEmail({ teamName, teamEmail, senderName, senderEmail, message }) {
    const html = `
      <h2>Someone is interested in joining your team!</h2>
      <p><strong>Name:</strong> ${senderName}</p>
      <p><strong>Email:</strong> ${senderEmail}</p>
      ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
      <p>You can reply directly to this email to contact them.</p>
    `;

    return this.sendEmail({
      to: teamEmail,
      subject: `New Player Interest - ${teamName}`,
      html,
      replyTo: senderEmail
    });
  }

  async sendTeamContactConfirmation({ teamName, senderEmail, senderName }) {
    const html = `
      <h2>Your message has been sent!</h2>
      <p>We've forwarded your contact information to the team captain of ${teamName}. 
      They will contact you directly if they're interested.</p>
      <p>Thank you for your interest!</p>
    `;

    return this.sendEmail({
      to: senderEmail,
      subject: `Contact Request Sent - ${teamName}`,
      html
    });
  }

  async sendPlayerContactEmail({ playerName, playerEmail, senderName, senderEmail, message }) {
    const html = `
      <h2>Someone is interested in connecting!</h2>
      <p><strong>Name:</strong> ${senderName}</p>
      <p><strong>Email:</strong> ${senderEmail}</p>
      ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
      <p>You can reply directly to this email to contact them.</p>
    `;

    return this.sendEmail({
      to: playerEmail,
      subject: `Team Finder - New Message from ${senderName}`,
      html,
      replyTo: senderEmail
    });
  }

  async sendPlayerContactConfirmation({ playerName, senderEmail }) {
    const html = `
      <h2>Your message has been sent!</h2>
      <p>We've forwarded your contact information to ${playerName}. 
      They will contact you directly if they're interested in connecting.</p>
      <p>Thank you for using our Team Finder service!</p>
    `;

    return this.sendEmail({
      to: senderEmail,
      subject: `Message Sent to ${playerName}`,
      html
    });
  }

  async sendPasswordResetEmail({ email, resetToken, teamName, frontendUrl }) {
    const resetUrl = `${frontendUrl || 'http://45.44.97.112'}/reset-password?token=${resetToken}&type=team`;
    
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your team captain account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #004d00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Team: ${teamName}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - Leather Pocket Pool League',
      html
    });
  }

  async sendTestEmail({ testEmail }) {
    const html = `
      <h1>Mailersend Test</h1>
      <p>This is a test email to verify Mailersend integration.</p>
      <p>If you received this email, the integration is working correctly!</p>
    `;

    return this.sendEmail({
      to: testEmail || this.fromEmail,
      subject: 'Mailersend Test Email',
      html
    });
  }
}

module.exports = new EmailService();