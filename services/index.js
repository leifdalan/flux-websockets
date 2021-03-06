import {
  signUp,
  logOut,
  login,
  isAdmin,
  isLoggedIn,
  changePassword
} from './authentication';

import {
  redirectUser,
  getUsers,
  getOneUser,
  updateUser,
  createUser,
  deleteUser,
  updateManyUsers} from './admin/users';

import {
  getChatRooms,
  createChat,
  getOneChatroom,
  setUpChatListeners,
  deleteChat
} from './admin/chat';

import {
  redirectPage,
  getPages,
  getOnePage,
  updatePage,
  createPage,
  deletePage,
  updateManyPages
} from './admin/pages';

import User from '../models/user';

import {sendMail} from './mail';
import config from '../config';
import Email from '../shared/components/Email';
import React from 'react';
import passport from 'passport';

import upload, {s3} from './upload';
const debug = require('debug')('Routes');

// Abstract of sending data from the server to client,
// whether its the first request or an in-app XHR.
export function sendData({data, req, res, next}) {
  const {success, error} = data;
  if (req.xhr) {
    if (error || !success) {
      debug('Error sending data:', error);
      res.status(400).json(data);
    } else {
      data.chatRooms = req.chatRooms;
      res.status(200).json(data);
    }
  } else {
    // TODO handle bad requests on the pass-a-long
    debug('Passing data along to server render.');
    req.preRender = data;
    req.preRender.chatRooms = req.chatRooms;
    next();
  }
}

export default function(server, io) {
  // all routes have a sidebar with the available chatrooms
  server.get('*', getChatRooms.bind(io));
  server.get('*', (req, res, next) => {
    if (req.query.token) {
      req.body.username = req.query.un;
      req.body.password = 'bar';
      req.tokenAttempt = true;
      login(req, res, next);
      // next();
    } else {
      next();
    }
  });
  // ----------------------------------------------------------------------------
  // Authorization endpoints
  // ----------------------------------------------------------------------------

  server.post('/signup', signUp);
  server.post('/login', login);
  server.post('/logout', logOut);

  server.get('/auth/google',
    passport.authenticate(
      'google',
      { scope: ['profile', 'email'] }
    )
  );

  server.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));

  server.get('/auth/facebook',
    passport.authenticate('facebook',
    {scope: 'email' }
    )
  );

  server.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));

  // send to twitter to do the authentication
  server.get('/auth/twitter',
    passport.authenticate(
      'twitter',
      { scope: 'email' }
    )
  );

  // handle the callback after twitter has authenticated the user
  server.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/'
    }));

  // ----------------------------------------------------------------------------
  // Admin Users CRUD (/admin/users)
  // ----------------------------------------------------------------------------

  server.get('/admin/users/', isLoggedIn, isAdmin, redirectUser);
  server.get(
    '/admin/users/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    getUsers
  );
  server.post('/admin/users/', isLoggedIn, isAdmin, createUser);
  server.put('/admin/users/', isLoggedIn, isAdmin, updateManyUsers);
  server.get('/admin/users/:id', isLoggedIn, isAdmin, getOneUser);
  server.put('/admin/users/:id', isLoggedIn, isAdmin, updateUser);
  server.delete('/admin/users/:id', isLoggedIn, isAdmin, deleteUser);

  // ----------------------------------------------------------------------------
  // Chat CRUD (/chatLobby)
  // ----------------------------------------------------------------------------

  server.get('/', (req, res, next) => {
    const data = {success: true};
    sendData({data, req, res, next});
  });
  server.get('/dashboard', (req, res, next) => {
    const data = {success: true};
    sendData({data, req, res, next});
  });
  server.get('/signin', (req, res, next) => {
    const data = {success: true};
    sendData({data, req, res, next});
  });
  server.get('/admin', (req, res, next) => {
    const data = {success: true};
    sendData({data, req, res, next});
  });
  server.get('/passwordReset', (req, res, next) => {
    const data = {success: true};
    sendData({data, req, res, next});
  });

  server.post('/passwordReset', isLoggedIn, changePassword);
  server.post('/sendPasswordReset', (req, res, next) => {
    User.findOne({'local.username': req.body.username}, (err, user) => {
      if (!err && user) {
        const {PROTOCOL, HOSTNAME, DEVELOPMENT_PORT} = config;
        const suffix = DEVELOPMENT_PORT ? `:${DEVELOPMENT_PORT}` : '';
        const href = `${PROTOCOL}${HOSTNAME}${suffix}` +
          `/passwordReset?token=${user.loginToken}&` +
          `un=${user.local.username}`;
        const markup = React.renderToStaticMarkup(React.createFactory(Email)({
          callToAction: href
        }));
        const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"` +
        ` "http://www.w3.org/TR/html4/loose.dtd">` +
        `${markup}`;
        debug(html);
        sendMail({
          from: 'farts@farts.com',
          to: 'leifdalan@gmail.com',
          subject: 'Password Reset Requested',
          html: html

          // : `<a href="${PROTOCOL}${HOSTNAME}${suffix}` +
          //   `/passwordReset?token=${user.loginToken}&` +
          //   `un=${user.local.username}">Reset password</a>` +
        }, () => {
          const data = {success: true};
          sendData({data, req, res, next});
        });
      }
    });
  });

  server.get('/sendMail', (req, res, next) => {
    debug('SENDING MAIL----------------------------------------');
    sendMail({
      from: 'farts@farts.com',
      to: 'leifdalan@gmail.com',
      subject: 'hi there',
      text: 'anotherone'
    }, () => {
      debug('custom callback');
    });
    const data = {success: true};
    sendData({data, req, res, next});
  });

  server.get('/chat', getChatRooms.bind(io));
  server.post('/chat/', createChat.bind(io));
  server.delete('/chat/:id', deleteChat.bind(io));
  server.get('/chat/:id', getOneChatroom.bind(io));
  setUpChatListeners(io);

  // ----------------------------------------------------------------------------
  // Admin Pages CRUD (/admin/pages)
  // ----------------------------------------------------------------------------

  server.get('/admin/pages/', isLoggedIn, isAdmin, redirectPage);
  server.get(
    '/admin/pages/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    getPages
  );
  server.post('/admin/pages/', isLoggedIn, isAdmin, createPage);
  server.put('/admin/pages/', isLoggedIn, isAdmin, updateManyPages);
  server.get('/admin/pages/:id', isLoggedIn, isAdmin, getOnePage);
  server.put('/admin/pages/:id', isLoggedIn, isAdmin, updatePage);
  server.delete('/admin/pages/:id', isLoggedIn, isAdmin, deletePage);

  // ----------------------------------------------------------------------------
  // Upload API
  // ----------------------------------------------------------------------------

  server.post('/upload', upload.bind(io));
  server.post('/s3', s3.bind(io));
}
