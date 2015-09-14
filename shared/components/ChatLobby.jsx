'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import {Link} from 'react-router';
import {createChatAction} from '../actions/chatActions';
import {handleActivityAction} from '../actions/chatActions';
const debug = require('debug')('Component:ChatLobby');
debug();

class ChatLobby extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'chat',
      'createChatRoom'
    ]);
  }

  static displayName = 'ChatLobby'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired,
    onNavigation: pt.func
  }

  componentDidMount() {
    try {
      const activitySocket = io && io();
      activitySocket.on('activity', (data) => {
        this.context.executeAction(handleActivityAction, data);
      });
    } catch(e) {
      debug('No connection!');
    }
  }

  createChatRoom(e) {
    e && e.preventDefault();
    const payload = {
      router: this.context.router,
      title: this.refs.title.getDOMNode().value
    };
    debug(payload);
    this.context.executeAction(createChatAction, payload);
  }

  chat() {

  }

  render() {
    debug(this.props.store);
    return (
      <div>
        <ul>
          {this.props.store.chatRooms.map((chatRoom, i) =>
            <li>
              <Link
                key={`chatroom${i}`}
                onClick={this.props.onNavigation}
                to={`/chat/${chatRoom._id}`}>
                {chatRoom.title} ({chatRoom.connectedUsers.length} connected)
              </Link>
            </li>
          )}
        </ul>
        <form onSubmit={this.createChatRoom}>
          <input type="text" ref="title" />
          <button
            type="submit">
            Create Chat
          </button>
        </form>
      </div>
    );
  }
}

ChatLobby = connectToStores(ChatLobby, ['ChatStore'], (stores) => {
  return {
    store: stores.ChatStore.getState()
  };
});

export default ChatLobby;
