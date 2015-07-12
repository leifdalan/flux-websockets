import {Strategy} from 'passport-local';
import User from '../models/user';
import uuid from 'uuid';
const debug = require('debug')('Passport');

export default function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id).populate('avatar').exec((err, user) => {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new Strategy({
      usernameField: 'email',
      passwordField: 'password',

      // allows us to pass in the req from our route
      // (lets us check if a user is logged in or not)
      passReqToCallback: true
      /*eslint-disable*/
    }, (req, email, password, done) => {
      /*eslint-enable*/
      if (email) {
        // Use lower-case e-mails to avoid case-sensitive e-mail matching
        email = email.toLowerCase();
      }

      let conditions = {
        'local.email': email
      }, tokenAttempt = false;
      if (req.tokenAttempt) {
        tokenAttempt = true;
        debug('Passport knows about the token.');
        conditions.loginToken = req.query.token;
      }

      process.nextTick(() => {
        if (tokenAttempt) {

          // Create new login token after each use.
          const newToken = uuid.v4();
          User.findOneAndUpdate(
            conditions,
            {loginToken: newToken},
            (err, user) => {
            // if there are any errors, return the error
            debug('TOKEN LOGIN', err, user);
            if (err) {
              return done(err);
            }
            // if no user is found, return the message
            if (!user) {
              return done(
                null, false, req.flash('loginMessage', 'No user found.')
              );
            }

            return done(null, user);

          });

        } else {
          User
          .findOne(conditions)
          .populate('avatar')
          .exec((err, user) => {
            // if there are any errors, return the error
            if (err) {
              return done(err);
            }
            // if no user is found, return the message
            if (!user) {
              return done(
                null, false, req.flash('loginMessage', 'No user found.')
              );
            }

            if (!user.validPassword(password)) {
              return done(
                null, false, req.flash('loginMessage', 'Oops! Wrong password.')
              );
            /*eslint-disable*/
            } else {
              return done(null, user);
            }
            /*eslint-enable*/
          });
        }
      });

    }));

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new Strategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
      /*eslint-disable*/
    }, (req, email, password, done) => {
      /*eslint-enable*/
      debug('LOCAL SIGNUP');
      if (email) {
        email = email.toLowerCase();
      }

      process.nextTick(() => {
        // if the user is not already logged in:
        if (!req.user || req.url === '/admin/users') {
          User.findOne({
            'local.email': email
          }, (err, user) => {

            // if there are any errors, return the error
            if (err) {
              debug('Signup Error.');
              return done(err);
            }

            // check to see if theres already a user with that email
            if (user) {
              debug('Signup Error, user already exists.');
              return done(
                {message: `${email} already exists.`}, false,
                req.flash('signupMessage', 'That email is already taken.'));
            /*eslint-disable*/
            } else {
            /*eslint-enable*/
              // create the user
              var newUser = new User();

              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.loginToken = newUser.generateToken();
              newUser.userLevel = req.body.userLevel;
              /*eslint-disable*/
              newUser.save((saveErr) => {
                if (saveErr) {
                  return done(saveErr);
                  debug('User saving failed.', saveErr);
                }
                return done(null, newUser);
              });
              /*eslint-enable*/
            }

          });
          // if the user is logged in but has no local account...
        } else {
          // user is logged in and already has a local account.
          // Ignore signup.
          return done(null, req.user);
        }
      });
    })
  );
}
