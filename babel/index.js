import path from 'path';
import express from 'express';
import session from 'express-session';
import favicon from 'serve-favicon';
import proxy from 'proxy-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import morgan from 'morgan';
import mongoose from 'mongoose';
import url from 'url';
import services from '../services';
import CST from '../shared/constants';
import reactRender from './reactrender';
import socketio from 'socket.io';
import http from 'http';


// Passport imports
import passport from 'passport';
import passportConfig from '../config/passport';
import config from '../config';
import passportSocketIo from 'passport.socketio';

const MongoStore = require('connect-mongo')(session);

const {
  PUBLIC_PATH: PUBLICPATH,
  WEBPACK_DEV_SERVER_PORT: DEVSERVERPORT,
  BROWSERSYNC_PORT: BSPORT,
  MONGOLAB_URI,
  HOSTNAME,
  PROTOCOL,
  DEVELOPMENT_PORT,
  SESSION_KEY,
  SESSION_SECRET
} = config;

const debug = require('debug')('Server');

mongoose.connect(MONGOLAB_URI);

passportConfig(passport);

const app = express();
const PORT = process.env.PORT || DEVELOPMENT_PORT;

debug('Environment Variables:');
debug('REACT_CLIENT_RENDER: %s', process.env.REACT_CLIENT_RENDER);
debug('REACT_SERVER_RENDER: %s', process.env.REACT_SERVER_RENDER);
debug('NODE_ENV: %s', process.env.NODE_ENV);
debug('ALWAYS_ADMIN: %s', process.env.ALWAYS_ADMIN);
debug(`Webpack Dev Server: ${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`);
debug(`BrowserSync Dev Server: ${PROTOCOL}${HOSTNAME}:${BSPORT}`);

// ----------------------------------------------------------------------------
// Express middleware (order matters!)
// ----------------------------------------------------------------------------

// log every request to the console
app.use(morgan('dev'));

// read cookies (needed for auth)
app.use(cookieParser());

// get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// var sessionStore = new MongoStore({
//   mongooseConnection: mongoose.connection
// });
// required for passport
// session secret
app.use(session({
  key: SESSION_KEY,
  secret: SESSION_SECRET,
  // store: sessionStore,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());

// persistent login sessions
app.use(passport.session());

// use connect-flash for flash messages stored in session
app.use(flash());

// Load our services and pass in our app and fully configured passport
// This is where all the routing for mongoDB service calls live.
var server = http.createServer(app);

server.listen(PORT, function() {
  debug('Express server listening on port ' + PORT);
});

// Initialize socket.io
var io = socketio.listen(server);

// With Socket.io >= 1.0
// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,       // the same middleware you registrer in express
//   key: SESSION_KEY,
//   secret: SESSION_SECRET,
//   store: sessionStore,
//   // success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
//   fail: (...args) => {
//     const accept = args[3];
//     debug('authorize failure for socket');
//     // accept anonymous socket connection attempts.
//     accept(null, true);
//   }
// }));


io.on('connection', (socket) => {
  socket.on('disconnect', function() {
    debug('disconnected==================================');
 });
});

services(app, io);

// Proxy public folder to WebPack's hot loading app during development
// If not development, we're using an S3 bucket for static assets.
if (process.env.NODE_ENV === 'development' &&
  process.env.REACT_CLIENT_RENDER !== 'false') {
  app.use(`${PUBLICPATH}`,
    proxy(url.parse(`${PROTOCOL}${HOSTNAME}:${DEVSERVERPORT}${PUBLICPATH}`))
  );
}

app.use(`${PUBLICPATH}`,
  express.static(path.join(__dirname, `../${PUBLICPATH}`))
);

app.use(favicon(path.join(__dirname, '../favicon.ico')));

// Fluxible + react-router markup generator, attemps to send response.
app.use(reactRender);

app.use((req, res) => {

  // ---------------------------------------------------------------------------
  // Last ditch effort to redirect if there's a react-router
  // failure or anything else that attaches abortNavigation to the
  // req object.
  // ---------------------------------------------------------------------------

  // TODO Make a sensible 500 page with React.renderToStaticMarkup.
  const markup500 = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Server error</h1>
    </body>
  </body>
  `;

  if (req.abortNavigation) {
    const {to, params, query, reactRenderError} = req.abortNavigation;
    debug('React aborting, attempting redirect.', to, params, query);
    if (params && params.reason) {
      req.flash('flashMessage', CST[params.reason]);
    }

    debug('Attempted URL:', req.url);
    req.flash('reqAttempt', req.url);

    if (reactRenderError) {
      res.status(500).send(markup500);
    } else if (to) {
      res.redirect(to);
    }

  } else {

    // Everything is broken.
    res.status(500).send(markup500);
  }
});


debug('Listening on port ' + PORT);
