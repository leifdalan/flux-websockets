import User from './models/user';
const debug = require('debug')('Routes');

export default function(server, passport) {

  // Middleware check for token logins
  server.use((req, res, next) => {
    if (req.query.token && req.query.un) {
      req.body.email = req.query.un;
      req.body.password = req.query.token;
      debug('Attempting token login.');
      req.tokenAttempt = true;
      login(req, res, next);
    } else {
      next();
    }
  });

  function isLoggedIn(req, res, next) {
    if (req.user) {
      debug('Is authenticated.');
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

  function isAdmin(req, res, next) {
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

  function login(req, res, next) {
    passport.authenticate('local-login', (err, user) => {
      debug('Logging in.');
      const failMessage = {
        success: false,
        message: 'Username or password incorrect.'
      };

      if (err) {
        return res.status(401).json(failMessage);
      }

      if (!user) {
        return res.status(401).json(failMessage);
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

          if (req.tokenAttempt) {
            next();
          } else {
            req.flash('flashMessage', 'Welcome!');
            res.redirect('/dashboard');
          }
        }
      });
    })(req, res, next);
  }

  // Abstract of sending data from the server to client,
  // whether its the first request or an in-app XHR.
  function sendData({data, req, res, next}) {
    debug('SEND DATA', data);
    if (req.xhr) {
      debug('XHR REQUEST=======================', data);
      res.json(data);
    } else {
      debug('PRERENDER=========================', data);
      req.preRender = data;
      next();
    }
  }

  // process the signup form
  server.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      debug('Logging in.');
      const failMessage = {
        success: false,
        message: 'Well, that didn\'t work.'
      };
      if (err) {
        return res.status(401).json(failMessage);
      }
      if (!user) {
        return res.status(401).json(failMessage);
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
  });

  server.post('/login', (req, res, next) => {
    debug(req.body);
    login(req, res, next);
  });

  server.get('/dashboard', isLoggedIn, (req, res, next) => {
    const data = {
      content: 'I\'m some content that\'s going to be awesome.'
    };
    sendData({data, req, res, next});
  });

  server.get('/admin-page', isAdmin, (req, res, next) => {
    const data = {
      content: 'Im an admin page, look at me go.'
    };
    sendData({data, req, res, next});
  });

  server.post('/logout', (req, res) => {
    req.logout();
    if (req.xhr) {
      res.send('YUP, logged out, dude.');
    } else {
      req.flash('flashMessage', 'Come back again soon!');
      res.redirect('/');
    }

  });

  // ----------------------------------------------------------------------------
  // Admin Users CRUD
  // ----------------------------------------------------------------------------

  server.get('/admin/users/', isLoggedIn, isAdmin, (req, res) => {
    res.redirect('/admin/users/page/20/1');
  });

  // server.post('/admin/users/', isLoggedIn, isAdmin, (req, res, next) => {
  //   passport.authenticate('local-signup', (err, user) => {
  //     debug('Logging in.');
  //     const failMessage = {
  //       success: false,
  //       message: 'Well, that didn\'t work.'
  //     };
  //     if (err) {
  //       return res.status(401).json(failMessage);
  //     }
  //     if (!user) {
  //       return res.status(401).json(failMessage);
  //     }
  //   })(req, res, next);
  // });

  // Paginated user Routes
  server.get(
    '/admin/users/page/:perpage/:currentPageNumber',
    isLoggedIn,
    isAdmin,
    (req, res, next) => {
    const {perpage, currentPageNumber} = req.params;
    debug(req.params.perpage);
    debug(req.params.currentPageNumber);
    let data = {
      perpage: Number(perpage),
      currentPageNumber: Number(currentPageNumber)
    };
    // TODO use generators + Promises for multiple async
    // http://davidwalsh.name/async-generators
    User.find({})
      .limit(perpage)
      .skip((currentPageNumber - 1) * perpage)
      .exec((err, users) => {
        User.count({}, (countError, count) => {
          data.totalUsers = count;
          if (err) {
            debug('USER ERROR', err);
            sendData({err, req, res, next});
          } else {
            data.users = users;
            debug('USERS', users);
            sendData({data, req, res, next});
          }
        });

      });
  });

  server.get('/admin/users/:id', isLoggedIn, isAdmin, (req, res, next) => {
    debug('GETTING USER');
    User.findOne({_id: req.params.id}, (err, users) => {
      if (err) {
        err.success = false;
        debug('USER ERROR', err);
        sendData({data: err, req, res, next});
      } else {
        debug('USERS', users);
        users.success = true;
        sendData({data: users, req, res, next});
      }
    });
  });

  server.put('/admin/users/:id', isLoggedIn, isAdmin, (req, res, next) => {
    debug('SETTING USER');

    // Encrypt new password, if it exists in the req.body.
    if (req.body.local.password) {
      let tempUser = new User();
      req.body.local.password = tempUser.generateHash(req.body.local.password);
    }

    User.findOneAndUpdate(
      {_id: req.params.id},
      req.body,
      {'new': true},
      (err, user) => {
        if (err) {
          const data = {
            error: err,
            success: false
          };

          debug('USER ERROR', err);
          err.success = false;
          sendData({data: data, req, res, next});
        } else {
          const data = {
            user,
            success: {
              message: 'User saved successfully.'
            }
          };

          user.success = true;
          debug('USERS', user);
          sendData({data: data, req, res, next});
        }
      });
  });
}