'use strict';

import {BaseStore} from 'fluxible/addons';
const debug = require('debug')('Store:Chat');

export default class ChatStore extends BaseStore {
  constructor(dispatcher) {
    super(dispatcher);
    this.chats = [];
    debug('CHAT STORE CONSTRUCTOR==========');
    this.connectedUsers = [];
    this.chatRoomId = null;
    this.chatRoomTitle = null;
    this.chatRooms = [];
  }

  static storeName = 'ChatStore'

  static handlers = {
    'EMIT_MESSAGE': 'handleMessageUpdate',
    'RECEIVED_MESSAGE': 'handleMessageUpdate',
    'RECEIVED_ACTIVITY': 'handleActivityUpdate',
    'CREATE_CHATROOM': 'createChatroom',
    'CHATROOM_PAYLOAD': 'populateChatlobby',
    'chatroom_PAYLOAD': 'populateChatroom'
  }

  populateChatroom(payload) {
    this.chatRoomId = payload._id;
    this.chatRoomTitle = payload.title;
    this.chats = payload.chats ? payload.chats.reverse() : [];
    this.connectedUsers = this.connectedUsers || [];
    this.emitChange();
  }

  populateChatlobby(payload) {
    this.chatRooms = payload;
    this.emitChange();
  }

  handleMessageUpdate(payload) {
    this.chats.push(payload);
    this.emitChange();
  }

  handleActivityUpdate(payload) {
    this.connectedUsers = payload.connectedUsers || [];
    this.chatRooms = this.chatRooms.map((chatRoom) => {
      if (chatRoom._id === payload.roomId) {
        chatRoom.connectedUsers = payload.connectedUsers;
      }
      return chatRoom;
    });
    this.emitChange();
  }

  createChatroom(payload) {
    debug('=====================================');
    debug(payload);
  }

  getState() {
    debug('Getting state from chatroom');
    return {
      chats: this.chats,
      connectedUsers: this.connectedUsers || [],
      chatRoomId: this.chatRoomId,
      chatRooms: this.chatRooms,
      chatRoomTitle: this.chatRoomTitle
    };
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.chats = state.chats;
    this.chatRoomId = state.chatRoomId;
    this.chatRooms = state.chatRooms;
    this.connectedUsers = state.connectedUsers;
    this.chatRoomTitle = state.chatRoomTitle;
  }
}
