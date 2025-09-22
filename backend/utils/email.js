
// utils/email.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_REFRESH_TOKEN,
  OAUTH_USER,
  MAIL_FROM,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

async function getTransport() {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: OAUTH_USER,
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  const transport = await getTransport();
  return transport.sendMail({
    from: MAIL_FROM || OAUTH_USER,
    to,
    subject,
    text,
    html,
  });
}
