import nodemailer from "nodemailer";

// Shared Gmail transporter for the API routes. Fails fast with a clear server
// log if the credentials are missing, instead of a vague SMTP auth error.
export function getMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD are not configured");
  }
  return {
    ownerAddress: user,
    transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }),
  };
}
