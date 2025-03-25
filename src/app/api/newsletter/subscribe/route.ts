import { NextRequest, NextResponse } from 'next/server';
import { addSubscriberToList, sendWelcomeEmail } from '@lib/services/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Add to SendGrid list
    const result = await addSubscriberToList(email);

    if (!result.success) {
      console.error('Failed to add subscriber to list:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Send welcome email
    await sendWelcomeEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
} 