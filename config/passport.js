import {Strategy} from 'passport-local';
import User from '../models/user';
import config from '../config';
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
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
      usernameField: 'username',
      passwordField: 'password',

      // allows us to pass in the req from our route
      // (lets us check if a user is logged in or not)
      passReqToCallback: true
      /*eslint-disable*/
    }, (req, username, password, done) => {
      console.log('login callback');
      /*eslint-enable*/
      if (username) {
        // Use lower-case e-mails to avoid case-sensitive e-mail matching
        username = username.toLowerCase();
      }

      let conditions = {
        'local.username': username
      }, tokenAttempt = false;
      if (req.tokenAttempt) {
        tokenAttempt = true;
        debug('Passport knows about the token.');
        conditions.loginToken = req.query.token;
      }

      process.nextTick(() => {
        if (tokenAttempt) {

          // Create new login token after each use.

          User.findOne(conditions)
            .populate('avatar')
            .exec((err, user) => {
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
          /*eslint-disable*/
          console.log('finding user');
          /*eslint-enable*/

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
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
      /*eslint-disable*/
    }, (req, username, password, done) => {
      console.log('username', username);
      /*eslint-enable*/
      debug('LOCAL SIGNUP');
      if (username) {
        username = username.toLowerCase();
      }

      process.nextTick(() => {
        /*eslint-disable*/
        console.log('local signup');
        /*eslint-enable*/

        User.findOne({
          'local.username': username
        }, (err, user) => {

          // if there are any errors, return the error
          if (err) {
            debug('Signup Error.');
            return done(err);
          }

          // check to see if theres already a user with that username
          if (user) {
            debug('Signup Error, user already exists.');
            return done(
              {message: `${username} already exists.`}, false,
              req.flash('signupMessage', 'That username is already taken.'));
          /*eslint-disable*/
          } else {
          /*eslint-enable*/
            // create the user
            var newUser = new User();

            newUser.local.username = username;
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
        // } else {
        //   debug(req.user);
        //   debug('already logged in?');
        //   // user is logged in and already has a local account.
        //   // Ignore signup.
        //   return done(null, req.user);
        // }
      });
    })
  );
  // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        passReqToCallback: true // allows us to pass in the req from our route
    },
    (...args) => {
      /*eslint-disable*/
      const [req, token, refreshToken, profile, done] = args;
      /*eslint-enable*/
      debug(profile);
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

              User.findOne({'google.id': profile.id }, function(err, user) {
                if (err) {
                  return done(err);
                }
                if (user) {
                  if (!user.google.token) {
                    user.google.token = token;
                    user.google.name  = profile.displayName;
                    user.google.email =
                      (profile.emails[0].value || '').toLowerCase();

                    user.save(function(saveErr) {
                      if (saveErr) {
                        return done(saveErr);
                      }

                      return done(null, user);
                    });
                  }

                  return done(null, user);
                /*eslint-disable*/
                } else {
                /*eslint-enable*/
                    var newUser          = new User();

                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email =
                      (profile.emails[0].value || '').toLowerCase(); // pull the first email
                    newUser.google.avatar =
                      profile.photos[0].value; // pull the first photo

                    newUser.save(function(newUserErr) {
                      if (newUserErr) {
                        return done(newUserErr);
                      }
                      return done(null, newUser);
                    });
                }
              });
            } else {
              // user already exists and is logged in, we have to link accounts
              var user               = req.user; // pull the user out of the session

              user.google.id    = profile.id;
              user.google.token = token;
              user.google.name  = profile.displayName;
              user.google.email =
                (profile.emails[0].value || '').toLowerCase();

              user.save(function(err) {
                if (err) {
                  return done(err);
                }

                return done(null, user);
              });
            }
        });
    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

      clientID: config.FACEBOOK_CLIENT_ID,
      clientSecret: config.FACEBOOK_CLIENT_SECRET,
      callbackURL: config.FACEBOOK_CALLBACK_URL,
      passReqToCallback: true,
      profileFields: ['id', 'displayName', 'photos', 'emails']
    },
    (...args) => {
    /*eslint-disable*/
    const [req, token, refreshToken, profile, done] = args;
    /*eslint-enable*/
    debug(profile);
    process.nextTick(function() {
      // check if the user is already logged in
      if (!req.user) {

        User.findOne({'facebook.id': profile.id }, function(err, user) {
          if (err) {
            return done(err);
          }


          if (user) {
            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name  = profile.displayName || profile.username;
              user.facebook.email = (profile.emails[0].value || '').toLowerCase();
              user.facebook.avatar = profile.photos[0].value;
              user.save(function(saveErr) {
                if (saveErr) {
                  return done(saveErr);
                }


                return done(null, user);
              });
            }

            return done(null, user); // user found, return that user

          /*eslint-disable*/
          } else {
          /*eslint-enable*/

              // if there is no user, create them
              var newUser            = new User();

              newUser.facebook.id    = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name  = profile.displayName || profile.username;
              newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

              newUser.save(function(saveErr) {
                  if (saveErr) {
                    return done(saveErr);
                  }

                  return done(null, newUser);
              });
            }
        });

      } else {
          // user already exists and is logged in, we have to link accounts
        var user            = req.user; // pull the user out of the session

        user.facebook.id    = profile.id;
        user.facebook.token = token;
        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = (profile.emails[0].value || '').toLowerCase();

        user.save(function(saveErr) {
            if (saveErr) {
              return done(saveErr);
            }

            return done(null, user);
        });
      }
    });

  }));
  // =========================================================================
// TWITTER =================================================================
// =========================================================================
/*eslint-disable*/
passport.use(new TwitterStrategy({

    consumerKey     : config.TWITTER_CLIENT_ID,
    consumerSecret  : config.TWITTER_CLIENT_SECRET,
    callbackURL     : config.TWITTER_CALLBACK_URL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

},
function(req, token, tokenSecret, profile, done) {
    console.log('profile', profile);
    // asynchronous
    process.nextTick(function() {

        // check if the user is already logged in
        if (!req.user) {

            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.twitter.token) {
                        user.twitter.token       = token;
                        user.twitter.username    = profile.username;
                        user.twitter.displayName = profile.displayName;

                        user.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, user);
                        });
                    }

                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser                 = new User();

                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;
                    newUser.twitter.avatar = profile.photos[0].value;

                    newUser.save(function(err) {
                        if (err)
                            return done(err);

                        return done(null, newUser);
                    });
                }
            });

        } else {
            // user already exists and is logged in, we have to link accounts
            var user                 = req.user; // pull the user out of the session

            user.twitter.id          = profile.id;
            user.twitter.token       = token;
            user.twitter.username    = profile.username;
            user.twitter.displayName = profile.displayName;

            user.save(function(err) {
                if (err)
                    return done(err);

                return done(null, user);
            });
        }

    });

}));
/*eslint-enable*/
}
