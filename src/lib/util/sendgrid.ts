import sgMail from '@sendgrid/mail';

// Set SendGrid API key 
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email sending will not work.');
}

/**
 * Send an email using SendGrid
 */
export const sendEmail = async (options: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}) => {
  try {
    await sgMail.send(options);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Send a contact form email to admin
 */
export const sendContactFormEmailToAdmin = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@conscious-genetics.com';
  
  const { name, email, subject, message } = data;
  
  return sendEmail({
    to: adminEmail,
    from: fromEmail,
    subject: `New Contact Form Submission: ${subject}`,
    text: `
      New contact form submission:
      
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
      ${message}
    `,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });
};

/**
 * Send a confirmation email to the user
 */
export const sendConfirmationEmailToUser = async (data: {
  name: string;
  email: string;
  subject: string;
}) => {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@conscious-genetics.com';
  const { name, email } = data;
  
  return sendEmail({
    to: email,
    from: fromEmail,
    subject: 'We received your message - Conscious Genetics',
    text: `
      Dear ${name},
      
      Thank you for contacting Conscious Genetics. We have received your message and will get back to you shortly.
      
      Best regards,
      The Conscious Genetics Team
    `,
    html: `
      <h2>Thank you for contacting us</h2>
      <p>Dear ${name},</p>
      <p>Thank you for contacting Conscious Genetics. We have received your message and our team will review it shortly.</p>
      <p>We aim to respond to all inquiries within 24-48 hours during business days.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The Conscious Genetics Team</strong></p>
    `,
  });
}; 