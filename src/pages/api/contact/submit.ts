import type { NextApiRequest, NextApiResponse } from "next";
import { saveContactMessage } from "@/services/contactService";
import nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

async function sendEmailNotification(data: ContactFormData) {
  // Configure your email service here
  // This example uses nodemailer with Gmail
  // You'll need to set up SMTP credentials in your .env.local:
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const inquiryTypeLabels: Record<string, string> = {
    general: "General Inquiry",
    support: "Technical Support",
    billing: "Billing Question",
    partnership: "Partnership Opportunity",
    feedback: "Feedback",
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: "info@thestaffspace.com",
    subject: `[StaffSpace Contact] ${inquiryTypeLabels[data.inquiryType] || data.inquiryType}: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Inquiry Type:</strong> ${inquiryTypeLabels[data.inquiryType] || data.inquiryType}</p>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; color: #555;">${data.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            <strong>Reply to:</strong> <a href="mailto:${data.email}">${data.email}</a>
          </p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

Inquiry Type: ${inquiryTypeLabels[data.inquiryType] || data.inquiryType}
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

Reply to: ${data.email}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, subject, message, inquiryType } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !inquiryType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Save to Firestore
    const saveResult = await saveContactMessage({
      name,
      email,
      subject,
      message,
      inquiryType,
    });

    // Send email notification
    let emailSent = false;
    let emailError = null;
    let smtpConfigured = false;

    // Check if SMTP credentials are configured
    const hasSmtpUser = !!process.env.SMTP_USER;
    const hasSmtpPassword = !!process.env.SMTP_PASSWORD;
    const hasSmtpHost = !!process.env.SMTP_HOST;
    const hasSmtpPort = !!process.env.SMTP_PORT;

    console.log("SMTP Configuration Check:", {
      hasSmtpUser,
      hasSmtpPassword,
      hasSmtpHost,
      hasSmtpPort,
      smtpUser: hasSmtpUser ? process.env.SMTP_USER : "NOT SET",
      smtpHost: hasSmtpHost ? process.env.SMTP_HOST : "NOT SET",
      smtpPort: hasSmtpPort ? process.env.SMTP_PORT : "NOT SET"
    });

    // Only attempt to send email if SMTP credentials are configured
    if (hasSmtpUser && hasSmtpPassword) {
      smtpConfigured = true;
      try {
        await sendEmailNotification({ name, email, subject, message, inquiryType });
        emailSent = true;
        console.log("Email notification sent successfully");
      } catch (error) {
        console.error("Email sending failed:", error);
        emailError = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      const missingVars = [];
      if (!hasSmtpUser) missingVars.push("SMTP_USER");
      if (!hasSmtpPassword) missingVars.push("SMTP_PASSWORD");
      console.warn(`SMTP credentials not configured. Missing: ${missingVars.join(", ")}. Email notification skipped.`);
    }

    return res.status(200).json({
      success: true,
      message: "Contact message received successfully",
      messageId: saveResult.id,
      emailSent,
      emailError,
      smtpConfigured,
      debug: {
        hasSmtpUser,
        hasSmtpPassword,
        hasSmtpHost,
        hasSmtpPort
      }
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return res.status(500).json({
      error: "Failed to process contact form",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}