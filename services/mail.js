import nodemailer from 'nodemailer';
import xoauth2 from 'xoauth2';
import config from '../config';
const debug = require('debug')('Mailer');

const generator = xoauth2.createXOAuth2Generator({
  user: 'leifdalan',
  clientId: config.GOOGLE_MAILER_CLIENT_ID,
  clientSecret: config.GOOGLE_MAILER_CLIENT_SECRET,
  refreshToken: config.GOOGLE_OAUTH_REFRESH_TOKEN,
  accessToken: config.GOOGLE_OAUTH_ACCESS_TOKEN
});

generator.on('token', (token) => {
  debug(token.user, token.accessToken);
});

export const transporter = nodemailer.createTransport(({
  service: 'gmail',
  auth: {
    xoauth2: generator
  }
}));

export function sendMail(opts, cb) {
  transporter.sendMail(opts, (err, success) => {
    if (err) {
      debug(err);
    } else {
      debug(success);
    }
    cb(err, success);
  });
}
