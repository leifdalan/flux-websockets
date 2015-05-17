'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {connectToStores} from 'fluxible/addons';
import {sendMessageAction} from '../actions/chatActions';
import {autoBindAll} from '../../utils';
import {handleMessageAction, handleActivityAction} from '../actions/chatActions';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {getTimeAgo} from '../../utils';
const debug = require('debug')('Component:ChatRoom');
debug();

class ChatRoom extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'submitChat',
      'handleMessageAction'
    ]);
  }

  static displayName = 'ChatRoom'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired,
    appStore: pt.object.isRequired
  }

  handleMessageAction(data) {
    this.context.executeAction(handleMessageAction, data);
  }

  componentDidMount() {
    const socket = io(`/${this.props.store.chatRoomTitle}`);
    const activitySocket = io();

    if (socket.disconnected) {
      socket.connect();
    }
    socket.on('chat', this.handleMessageAction);
    activitySocket.on('activity', (data) => {
      this.context.executeAction(handleActivityAction, data);
    });
    this.interval = window.setInterval(() => {
      this.forceUpdate();
    }.bind(this), 10000);
    this.socket = socket;
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.socket.removeListener('chat', this.handleMessageAction);
    this.socket.disconnect();
  }

  submitChat(e) {
    e.preventDefault();
    const content = findDOMNode(this.refs.content).value;
    debug('content', content);
    const user = this.props.appStore.userId;
    const channel = `/${this.props.store.chatRoomTitle}`;
    this.context.executeAction(sendMessageAction, {content, user, channel});
  }

  render() {
    debug(this.props.store);
    return (
      <div>
        <h1>{this.props.store.chatRoomTitle}</h1>
        <h2>{this.props.store.connectedUsers.length} connected</h2>
        <ul>
          {this.props.store.connectedUsers.map((user) =>
            <li>{user}</li>
          )}
        </ul>
        <form onSubmit={this.submitChat}>
          <input ref="content" type="text" />
          <button type="submit">Submit</button>
        </form>
        <TransitionGroup component="div" transitionName="example">
          {this.props.store.chats.map((chat, i) =>
            <div key={`chat${i}`}>
              <div>{chat.user ? chat.user.local.email : 'Anon'}:</div>
              <div>{chat.content}</div>
              <div>{getTimeAgo(chat.created)}</div>
            </div>
          )}
        </TransitionGroup>
      </div>
    );
  }
}

ChatRoom = connectToStores(ChatRoom, ['ChatStore', 'ApplicationStore'], (stores) => {
  return {
    store: stores.ChatStore.getState(),
    appStore: stores.ApplicationStore.getState()
  };
});

export default ChatRoom;
