import { NextRequest, NextResponse } from 'next/server';
import { addSubscriberToList, sendWelcomeEmail } from '@lib/services/sendgrid';
import sgMail from '@sendgrid/mail';
import { emailRegex } from '@lib/constants';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log('Received subscription request for email:', email);

    // Validate email
    if (!email || !emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Add contact to SendGrid list
    const data = {
      contacts: [
        {
          email,
          custom_fields: {},
        },
      ],
    };

    console.log('Sending request to SendGrid API...');
    const response = await fetch(
      `https://api.sendgrid.com/v3/marketing/contacts`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();
    console.log('SendGrid API response:', responseData);

    if (!response.ok) {
      console.error('SendGrid API error:', responseData);
      return NextResponse.json(
        { success: false, message: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    // Send welcome email
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || '',
      subject: 'Welcome to Our Newsletter!',
      text: 'Thank you for subscribing to our newsletter. We look forward to sharing updates with you!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b2a9b;">Welcome to Our Newsletter!</h1>
          <p>Thank you for subscribing to our newsletter. We look forward to sharing updates with you!</p>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
    };

    console.log('Sending welcome email...');
    await sgMail.send(msg);
    console.log('Welcome email sent successfully');

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while subscribing to the newsletter' },
      { status: 500 }
    );
  }
} 