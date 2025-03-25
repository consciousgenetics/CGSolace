import sgMail from '@sendgrid/mail';
import client from '@sendgrid/client';

// Initialize SendGrid client with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  client.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set');
}

/**
 * Add a subscriber to a SendGrid marketing list
 */
export async function addSubscriberToList(email: string) {
  if (!process.env.SENDGRID_NEWSLETTER_LIST_ID) {
    throw new Error('SENDGRID_NEWSLETTER_LIST_ID is not configured');
  }

  try {
    const data = {
      list_ids: [process.env.SENDGRID_NEWSLETTER_LIST_ID],
      contacts: [
        {
          email,
        },
      ],
    };

    const request = {
      url: '/v3/marketing/contacts',
      method: 'PUT' as const,
      body: data,
    };

    const [response] = await client.request(request);
    return { success: response.statusCode >= 200 && response.statusCode < 300 };
  } catch (error) {
    console.error('Error adding subscriber to SendGrid list:', error);
    return { success: false, error };
  }
}

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(email: string) {
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL is not configured');
  }

  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Welcome to Solace Newsletter',
      text: 'Thanks for subscribing to our newsletter! We\'ll keep you updated with the latest news and offers.',
      html: '<strong>Thanks for subscribing to our newsletter!</strong><p>We\'ll keep you updated with the latest news and offers.</p>',
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
} 