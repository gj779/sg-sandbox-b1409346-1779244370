import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This is a diagnostic endpoint - shows SMTP configuration status
  const smtpConfig = {
    SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
    SMTP_PORT: process.env.SMTP_PORT || "NOT SET",
    SMTP_USER: process.env.SMTP_USER || "NOT SET",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "SET (hidden)" : "NOT SET",
    configured: !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD),
  };

  return res.status(200).json({
    message: "SMTP Configuration Status",
    config: smtpConfig,
    instructions: smtpConfig.configured 
      ? "✅ SMTP is configured! Emails should be sent."
      : "❌ SMTP is not fully configured. Add missing environment variables in Vercel."
  });
}