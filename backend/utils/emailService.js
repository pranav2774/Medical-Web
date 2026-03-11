const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM || 'Morya Medical <onboarding@resend.dev>';

/**
 * Send email verification OTP to user
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} [name] - User name for personalization
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendVerificationEmail(to, otp, name = 'User') {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'MORYA MEDICAL <admin@moryamedical.shop>',
      to: [to],
      subject: 'Verify your email - Morya Medical',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Morya Medical</h2>
          <p>Hi ${name},</p>
          <p>Use the following code to verify your email address:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${otp}</p>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Morya Medical - Community Engagement Project</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Send verification email error:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

module.exports = { sendVerificationEmail };
