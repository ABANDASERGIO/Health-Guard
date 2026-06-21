import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, otpCode: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || "HealthGuard <noreply@healthguard.local>";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[DEV] Password reset OTP for ${to}: ${otpCode}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "HealthGuard password reset OTP",
    text: `Your HealthGuard password reset OTP is: ${otpCode}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>HealthGuard password reset</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 32px; letter-spacing: 0.3em; font-weight: 700; margin: 24px 0;">
          ${otpCode}
        </div>
        <p>This code expires in 10 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}
