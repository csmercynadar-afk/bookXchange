require("dotenv").config({ override: true });
const { Resend } = require("resend");
const nodemailer = require("nodemailer");

const RESEND_KEY = (process.env.RESEND_API_KEY || "").trim();
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Resend's shared sender only works for testing. Once you verify your own domain
// in Resend, set EMAIL_FROM="BookXchange <noreply@yourdomain.com>" in .env.
const FROM = process.env.EMAIL_FROM || "BookXchange <onboarding@resend.dev>";

let gmailTransport = null;
const getGmail = () => {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, ""); // app passwords are shown with spaces
  if (!user || !pass) return null;
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return { transport: gmailTransport, user };
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: html || text,
    text: text || html,
  });
  if (error) throw new Error(error.message || JSON.stringify(error));
  return data?.id;
};

const sendViaGmail = async ({ to, subject, html, text }) => {
  const gmail = getGmail();
  if (!gmail) throw new Error("Gmail fallback not configured (EMAIL_USER / EMAIL_PASS)");
  const info = await gmail.transport.sendMail({
    from: `BookXchange <${gmail.user}>`,
    to,
    subject,
    html: html || text,
    text: text || html,
  });
  return info.messageId;
};

/**
 * Tries Resend first, then Gmail SMTP. Never throws — returns { success, ... }.
 */
const sendEmail = async (mail) => {
  const errors = [];

  if (resend) {
    try {
      const id = await sendViaResend(mail);
      console.log("✅ Email sent via Resend — ID:", id);
      return { success: true, provider: "resend", messageId: id };
    } catch (err) {
      errors.push(`Resend: ${err.message}`);
      console.error("❌ Resend failed:", err.message);
      if (/only send testing emails to your own email|verify a domain/i.test(err.message)) {
        console.error("   → Resend's free 'onboarding@resend.dev' sender can ONLY deliver to the email");
        console.error("     you signed up to Resend with. Verify a domain at resend.com/domains to email anyone.");
      }
      if (/API key is invalid|restricted_api_key|401|403/i.test(err.message)) {
        console.error("   → Check RESEND_API_KEY in backend/.env (create a new key at resend.com/api-keys).");
      }
    }
  } else {
    errors.push("Resend: RESEND_API_KEY not set");
  }

  try {
    const id = await sendViaGmail(mail);
    console.log("✅ Email sent via Gmail SMTP — ID:", id);
    return { success: true, provider: "gmail", messageId: id };
  } catch (err) {
    errors.push(`Gmail: ${err.message}`);
    console.error("❌ Gmail SMTP failed:", err.message);
    if (/Invalid login|Username and Password not accepted|535/i.test(err.message)) {
      console.error("   → EMAIL_PASS must be a 16-character Google *App Password* (needs 2-Step Verification),");
      console.error("     not your normal Gmail password.");
    }
  }

  return { success: false, error: errors.join(" | ") };
};

module.exports = sendEmail;
