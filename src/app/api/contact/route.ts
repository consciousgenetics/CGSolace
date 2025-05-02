import { NextResponse } from 'next/server'
import { sendContactFormEmailToAdmin, sendConfirmationEmailToUser } from '@lib/util/sendgrid'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    // Validate the input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Send the form data to admin
    const adminEmailResult = await sendContactFormEmailToAdmin({
      name,
      email,
      subject,
      message
    })

    if (!adminEmailResult.success) {
      console.error('Failed to send email to admin:', adminEmailResult.error)
      return NextResponse.json(
        { error: 'Failed to send your message. Please try again later.' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const userEmailResult = await sendConfirmationEmailToUser({
      name,
      email,
      subject
    })

    if (!userEmailResult.success) {
      console.warn('Failed to send confirmation email to user:', userEmailResult.error)
      // Continue despite confirmation email failure
    }

    // Log for debugging
    console.log('Contact form processed successfully:', { name, email, subject })

    // Send success response
    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 