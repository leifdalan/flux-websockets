'use strict';

import {BaseStore} from 'fluxible/addons';
const debug = require('debug')('Store:Chat');

export default class ChatStore extends BaseStore {
  constructor(dispatcher) {
    super(dispatcher);
    this.chats = [];
  }

  static storeName = 'ChatStore'

  static handlers = {
    'EMIT_MESSAGE': 'handleMessageUpdate',
    'RECEIVED_MESSAGE': 'handleMessageUpdate',
  }

  handleMessageUpdate(payload) {
    this.chats.push(payload);
    this.emitChange();
  }

  getState() {
    debug('Getting state from chatroom');
    return {
      chats: this.chats
    };
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.chats = state.chats;
  }
}
