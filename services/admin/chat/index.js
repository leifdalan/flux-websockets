import Chat from '../../../models/chat';
import ChatRoom from '../../../models/chatroom';
import {sendData} from '../../../services';
import {pull} from 'lodash';
import uuid from 'uuid';
const debug = require('debug')('Chat:ProcessMessages');

let connectedMap = {};
// ----------------------------------------------------------------------------
// Chat room CRUD
// ----------------------------------------------------------------------------
function listenOnChannel(io, chatroom) {

  var nsp = io.of(`/${chatroom.title}`);
  let connectedUsers = [];

  nsp.on('connection', function (socket) {

    const user = socket.request.user.logged_in ?
      socket.request.user.local.email :
      `Anon-${uuid.v4()}`;

    connectedUsers.push(user);

    io.emit('activity', {
      roomId: chatroom._id,
      room: chatroom.title,
      activity: `${user} joined`,
      connectedUsers
    });

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
              debug('NEWCHAT', popChat);
              nsp.emit('chat', newChat);
            }
          });
        }
      });
    }

    socket.on('chat', saveChat);

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
  ChatRoom.findOne({_id: req.params.id}, (error, chatroom) => {
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
      Chat.find({room: chatroom.title})
        .sort({_id: -1})
        .populate('user')
        .exec((errorWithTitle, chatsWithTitle) => {
        debug('PAGE DATA', data);
        debug('PAGE DATA', chatsWithTitle);
        data.chats = chatsWithTitle;
        sendData({data, req, res, next});
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
      debug(chatrooms);
      chatrooms = chatrooms.map((chatroom) => {
        chatroom = chatroom.toObject();
        chatroom.connectedUsers = connectedMap[chatroom._id] || [];
        return chatroom;
      });
      data = chatrooms;
      data.success = true;

    }
    debug('CONNECTED MAP', connectedMap);
    sendData({data, req, res, next});
  });
}

export function setUpChatListeners(io) {
  ChatRoom.find({}, (error, chatrooms) => {
    chatrooms.map(listenOnChannel.bind(null, io));
  });
}
