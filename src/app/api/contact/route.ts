import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanSubject = (subject || 'General Inquiry').trim().slice(0, 200);
    const cleanMessage = message.trim().slice(0, 5000);

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send email to Numvax inbox
    await transporter.sendMail({
      from: `"Numvax Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: `"${cleanName}" <${cleanEmail}>`,
      subject: `[Numvax Contact] ${cleanSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #171717; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">New Contact Message</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.7;">numvax.com</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 100px;">From:</td>
                <td style="padding: 8px 12px; color: #171717;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 12px;"><a href="mailto:${cleanEmail}" style="color: #2563eb;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">Subject:</td>
                <td style="padding: 8px 12px; color: #171717;">${cleanSubject}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e5e5;">
              <p style="font-size: 13px; color: #555; margin: 0 0 8px; font-weight: bold;">Message:</p>
              <p style="font-size: 14px; color: #171717; margin: 0; line-height: 1.6; white-space: pre-wrap;">${cleanMessage}</p>
            </div>
            <p style="font-size: 11px; color: #999; margin: 16px 0 0; text-align: center;">
              You can reply directly to this email to respond to ${cleanName}.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (err: any) {
    console.error('Contact form email error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
