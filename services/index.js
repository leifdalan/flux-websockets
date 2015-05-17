import {signUp, logOut, login, isAdmin, isLoggedIn} from './authentication';
// import Page from '../models/page';
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
  setUpChatListeners} from './admin/chat';
const debug = require('debug')('Routes');

// Abstract of sending data from the server to client,
// whether its the first request or an in-app XHR.
export function sendData({data, req, res, next}) {
  debug('Sending data:');
  const {success, error} = data;
  if (req.xhr) {
    debug('Via XHR');
    if (error || !success) {
      debug('Error sending data:', error);
      res.status(400).json(data);
    } else {
      res.status(200).json(data);
    }

  } else {
    // TODO handle bad requests on the pass-a-long
    debug('Passing data along to server render.');
    req.preRender = data;
    next();
  }
}

export default function(server, io) {

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

  // ----------------------------------------------------------------------------
  // Authorization endpoints
  // ----------------------------------------------------------------------------

  server.post('/signup', signUp);
  server.post('/login', login);
  server.post('/logout', logOut);

  // ----------------------------------------------------------------------------
  // Admin Users CRUD (/admin/users)
  // ----------------------------------------------------------------------------

  // server.get('/admin/users/', isLoggedIn, isAdmin, redirectUser);
  // server.get(
  //   '/admin/users/page/:perpage/:currentPageNumber',
  //   isLoggedIn,
  //   isAdmin,
  //   getUsers
  // );
  // server.post('/admin/users/', isLoggedIn, isAdmin, createUser);
  // server.put('/admin/users/', isLoggedIn, isAdmin, updateManyUsers);
  // server.get('/admin/users/:id', isLoggedIn, isAdmin, getOneUser);
  // server.put('/admin/users/:id', isLoggedIn, isAdmin, updateUser);
  // server.delete('/admin/users/:id', isLoggedIn, isAdmin, deleteUser);
  //
  // ----------------------------------------------------------------------------
  // Chat CRUD (/chatLobby)
  // ----------------------------------------------------------------------------

  server.get('/chat/', getChatRooms.bind(io));
  server.post('/chat/', createChat.bind(io));
  server.get('/chat/:id', getOneChatroom.bind(io));
  setUpChatListeners(io);
}
