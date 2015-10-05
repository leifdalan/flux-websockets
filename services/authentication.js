import passport from 'passport';
import User from '../models/user';
import {sendData} from '../services';
const debug = require('debug')('Routes:Authentication');

export function signUp(req, res, next) {
  passport.authenticate('local-signup', (err, user) => {
    debug('Attempting passport authenticate.');
    if (err) {
      return res.status(401).json({
        success: false,
        message: err
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user...'
      });
    }
    req.logIn(user, function(loginErr) {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.xhr) {
        res.json({
          success: true,
          user
        });
      } else {
        // Support for no Javascript.
        res.redirect('/dashboard');
      }
    });
  })(req, res, next);
}

export function logOut(req, res) {
  req.logout();
  if (req.xhr) {
    res.send('YUP, logged out, dude.');
  } else {
    req.flash('flashMessage', 'Come back again soon!');
    res.redirect('/');
  }
}

export function login(req, res, next) {
  passport.authenticate('local-login', (err, user) => {
    debug('Logging in.');
    if (err) {
      return res.status(401).json({
        success: false,
        message: err
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found.'
      });
    }

    req.logIn(user, function(loginErr) {
      if (loginErr) {
        return next(loginErr);
      }

      if (req.xhr) {
        if (req.tokenAttempt) {
          next();
        } else {
          res.json({
            success: true,
            user
          });
        }

      } else {

        if (req.tokenAttempt) {
          debug('Token attempt...');
          next();
        } else {
          req.flash('flashMessage', 'Welcome!');
          res.redirect('/dashboard');
        }
      }
    });
  })(req, res, next);
}

export function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    debug('Adding abort because not authenticated.');
    req.abortNavigation = {
      to: '/signin',
      params: {
      reason: 'UNAUTHENTICATED'
      }
    };
    next();
  }
}

export function isAdmin(req, res, next) {
  if (req.user && req.user.userLevel > 1) {
    debug('Is authorized.');
    next();
  } else {
    debug('Adding abort on because not authorized.');
    req.abortNavigation = {
      to: '/signin',
      params: {
        reason: 'UNAUTHORIZED'
      }
    };
    next();
  }
}

export function changePassword(req, res, next) {
  User.findOne(req.user._id, (userErr, user) => {
    var newUser = new User();
    user.local.password = newUser.generateHash(req.body.password);
    user.save((saveErr) => {
      if (saveErr) {
        debug(saveErr);
        req.flash(`Error changing password: ${saveErr}`);
      } else {
        const data = {
          success: true,
          message: 'Changed password'
        };
        sendData({data, req, res, next});
      }
    });
  });
}
