import nodemailer from "nodemailer";
import { logger } from "./logger";

let transporter: nodemailer.Transporter | null = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const isResend = (process.env.SMTP_HOST || "").includes("resend");

  // Robust boolean check
  const isSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true";

  const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    logger.warn("SMTP credentials not configured");
    return null;
  }

  // Log configuration (safely)
  logger.info({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user,
    isResend
  }, "Creating SMTP Transporter");

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  const emailTransporter = createTransporter();

  if (!emailTransporter) {
    logger.warn({ to, subject }, "Email service not configured, skipping email send");
    return;
  }

  // Use Resend HTTP API immediately if detected (avoid SMTP delays on Render)
  const isResend = (process.env.SMTP_HOST || "").includes("resend");
  if (isResend) {
    try {
      await sendResendApi(to, subject, html || text);
      return;
    } catch (apiError) {
      logger.error({ apiError }, "Resend API failed");
      throw new Error(`Failed to send email via API: ${(apiError as Error).message}`);
    }
  }

  try {
    // Determine 'from' address
    // If using Resend and no specific FROM is set, MUST use onboarding@resend.dev to avoid errors
    let fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    if (isResend && !process.env.SMTP_FROM_EMAIL) {
      fromEmail = "onboarding@resend.dev";
      logger.info("Using default Resend sender: onboarding@resend.dev");
    }

    await emailTransporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text,
      html: html || text,
    });

    logger.info({ to, subject, from: fromEmail }, "Email sent successfully");
  } catch (error) {
    logger.error({ error, to, subject }, "Failed to send email");
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
};

// Helper for Resend HTTP API (Bypasses SMTP port blocking on Render)
const sendResendApi = async (to: string, subject: string, html: string) => {
  const apiKey = process.env.SMTP_PASS; // The password IS the API key
  if (!apiKey) throw new Error("Missing API Key for Resend");

  logger.info({ to, subject, apiKeyPrefix: apiKey.substring(0, 8) + "..." }, "Attempting Resend API call");

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SMTP_FROM_EMAIL || "onboarding@resend.dev",
        to: [to],
        subject: subject,
        html: html,
      }),
    });
  } catch (fetchError: any) {
    // Network-level error (DNS, timeout, etc.)
    logger.error({ message: fetchError?.message, code: fetchError?.code, to }, "Resend API network error");
    throw new Error(`Resend API network error: ${fetchError?.message || "Unknown"}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, body: errorText, to }, "Resend API returned error response");
    throw new Error(`Resend API Error: ${response.status} ${errorText}`);
  }

  const responseData = await response.json() as any;
  logger.info({ to, subject, method: "HTTP-API", id: responseData?.id }, "Email sent successfully via Resend API");
};

export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  const subject = "Your Nomadly Verification Code";
  const text = `Your verification code is: ${code}. This code expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Nomadly Verification Code</h2>
      <p>Your verification code is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color: #666;">This code expires in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, text, html);
  } catch (error) {
    logger.error({ error, email }, "Failed to send OTP email");
  }
};
