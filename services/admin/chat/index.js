import Chat from '../../../models/chat';
const debug = require('debug')('Chat:ProcessMessages');

// ----------------------------------------------------------------------------
// Chat room CRUD
// ----------------------------------------------------------------------------


export default function (io, req) {
  io.on('connection', function (socket) {
    debug('CONNNECTED');
    socket.on('chat', (chat) => {
      debug('saving chat', chat);
      let newChat = new Chat(chat);
      newChat.save((newChatError) => {
        if (newChatError) {
          io.emit('chatError');
        } else {
          newChat.populate('user', (popError, popChat) => {
            if (popError) {
              io.emit('chatError');
            } else {
              debug('NEWCHAT', popChat);
              io.emit('chat', popChat);
            }
          });
        }
      });
    });
  });
  debug('SETTING UP CHAT.....');
  io.on('chat', (chat) => {
    debug('CHATTTTTTT!!!!!!', chat);
  });
}
