import Chat from '../../../models/chat';
import ChatRoom from '../../../models/chatroom';
import {sendData} from '../../../services';
import {pull, includes} from 'lodash';
import uuid from 'uuid';
const debug = require('debug')('Chat:ProcessMessages');

let connectedMap = {};
// ----------------------------------------------------------------------------
// Chat room CRUD + chat socket management
// ----------------------------------------------------------------------------
function listenOnChannel(io, chatroom) {

  var nsp = io.of(`/${chatroom.title}`);
  let connectedUsers = [];

  nsp.on('connection', function (socket) {
    debug('connected');
    const user = socket.request.user.logged_in ?
      socket.request.user.local.username ||
      socket.request.user.google.name ||
      socket.request.user.twitter.name ||
      socket.request.user.facebook.name :
      `Anon-${uuid.v4()}`;

    if (!includes(connectedUsers, user)) {
      connectedUsers.push(user);
      io.emit('activity', {
        roomId: chatroom._id,
        room: chatroom.title,
        activity: `${user} joined`,
        connectedUsers
      });
    }

    connectedMap[chatroom._id] = connectedUsers;

    function saveChat(chat) {
      chat.room = chatroom.title;
      let newChat = new Chat(chat);
      newChat.save((newChatError) => {
        if (newChatError) {
          io.emit('chatError');
        } else {
          newChat.populate('user', (popError, popChat) => {
            if (popError) {
              nsp.emit('chatError');
            } else {
              popChat.user.populate('avatar', (chatErr) => {
                if (chatErr) {
                  nsp.emit(chatErr);
                }
                debug('NEWCHAT', popChat);
                nsp.emit('chat', popChat);
              });
            }
          });
        }
      });
    }

    socket.on('chat', saveChat);

    socket.on('typing', (payload) => {
      nsp.emit('typing', payload);
    });

    socket.on('disconnect', () => {
      socket.removeListener('chat', saveChat);
      pull(connectedUsers, user);
      connectedMap[chatroom._id] = connectedUsers;

      io.emit('activity', {
        roomId: chatroom._id,
        room: chatroom.title,
        activity: `${user} left`,
        connectedUsers
      });

    });
  });
}

export function createChat(req, res, next) {
  ChatRoom.create(req.body, (error, chatroom) => {
    let data = {};
    if (error) {
      data = {
        success: false,
        error
      };
      debug('Creation error');
    } else {
      data = {
        success: {
          message: `"${chatroom.title}" created!`
        },
        chatroom
      };
    }
    listenOnChannel(this, chatroom);
    sendData({data, req, res, next});
  });
}

export function deleteChat(req, res, next) {
  debug('deleting', req.params.id);
  ChatRoom.findByIdAndRemove(req.params.id, (error, chatroom) => {
    let data = {};
    if (error) {
      data = {
        success: false,
        error
      };
      debug('Deletion error');
    } else {
      debug(chatroom);
      data = {
        success: {
          message: `Deleted!`
        },
        chatroom
      };
    }
    sendData({data, req, res, next});
  });
}

export function getOneChatroom(req, res, next) {
  ChatRoom.findOne(
    {_id: req.params.id},
    (error, chatroom) => {
    let data;
    if (error) {
      data = {
        success: false,
        error
      };
      debug('PAGE ERROR', error);
      sendData({data, req, res, next});
    } else {
      if (!chatroom) {
        data = {
          success: false,
          error: `No chatroom found for ${req.params.id}`
        };
      } else {
        debug(chatroom);
        data = chatroom.toObject();
        data.success = true;
      }
      let chats = [],
          avatarPromises = [];
      Chat
        .find({room: chatroom.title})
        .sort({created: -1})
        .populate('user')
        .populate('user.avatar')
        .exec((errorWithTitle, chatsWithTitle) => {
        chatsWithTitle.forEach((chatWithTitle) => {
          if (chatWithTitle.user) {
            const avatarPromise = new Promise((resolve, reject) => {
              chatWithTitle.user.populate('avatar', (err, chat) => {
                if (err) {
                  reject(err);
                }
                chats.unshift(chat);
                resolve(chat);
              });
            });
            avatarPromises.unshift(avatarPromise);
          }
        });
        Promise.all(avatarPromises).then(() => {
          data.chats = chatsWithTitle;
          sendData({data, req, res, next});
        });
      });
    }
  });
}

export function getChatRooms(req, res, next) {

  ChatRoom.find({}, (error, chatrooms) => {
    let data;
    if (!chatrooms) {
      data = {
        success: false,
        error: `No chatrooms.`
      };
    } else {
      debug(`Found ${chatrooms.length} chatrooms`);
      chatrooms = chatrooms.map((chatroom) => {
        chatroom = chatroom.toObject();
        chatroom.connectedUsers = connectedMap[chatroom._id] || [];
        return chatroom;
      });
      data = chatrooms;
      data.success = true;
    }

    req.chatRooms = data;
    next();
  });
}

export function setUpChatListeners(io) {
  ChatRoom.find({}, (error, chatrooms) => {
    chatrooms.map(listenOnChannel.bind(null, io));
  });
}
