import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(`[mailer] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipped email to ${to}: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({ from: `Chowly <${process.env.GMAIL_USER}>`, to, subject, html });
    console.log(`[mailer] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[mailer] Failed to send "${subject}" to ${to}:`, err.message);
  }
}

export function verifyEmailTemplate(name, link) {
  return {
    subject: 'Confirm your Chowly account',
    html: `<div style="font-family:sans-serif;padding:24px;color:#111">
      <h2>Hi ${name},</h2>
      <p>Thanks for signing up to Chowly. Click the button below to confirm your email and activate your account.</p>
      <p style="margin:24px 0"><a href="${link}" style="background:#ff7a00;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Confirm my email</a></p>
      <p style="color:#888;font-size:13px">If the button doesn't work, copy and paste this link: ${link}</p>
      <p style="color:#888;font-size:13px">If you didn't create this account, you can ignore this email.</p>
    </div>`
  };
}

export function passwordResetEmailTemplate(name, link) {
  return {
    subject: 'Reset your Chowly password',
    html: `<div style="font-family:sans-serif;padding:24px;color:#111">
      <h2>Hi ${name},</h2>
      <p>We got a request to reset your Chowly password. Click the button below to set a new one. This link expires in 30 minutes.</p>
      <p style="margin:24px 0"><a href="${link}" style="background:#ff7a00;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Reset my password</a></p>
      <p style="color:#888;font-size:13px">If the button doesn't work, copy and paste this link: ${link}</p>
      <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>`
  };
}

export function restaurantApplicationEmail(contactName, restaurantName) {
  return {
    subject: `We received your Chowly application — ${restaurantName}`,
    html: `<div style="font-family:sans-serif;padding:24px;color:#111">
      <h2>Hi ${contactName},</h2>
      <p>Thanks for applying to bring <strong>${restaurantName}</strong> onto Chowly. Our team will review your details and follow up with next steps, including setting up your menu.</p>
      <p style="color:#888;font-size:13px">This is a demo confirmation email for the Chowly assignment.</p>
    </div>`
  };
}