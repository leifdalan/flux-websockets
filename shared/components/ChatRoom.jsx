'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {connectToStores} from 'fluxible/addons';
import {sendMessageAction} from '../actions/chatActions';
import {autoBindAll} from '../../utils';
import {
  handleMessageAction,
  handleActivityAction,
  deleteChatAction
} from '../actions/chatActions';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {getTimeAgo} from '../../utils';
const debug = require('debug')('Component:ChatRoom');
debug();

class ChatRoom extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'submitChat',
      'handleMessageAction',
      'onInputChange',
      'deleteChatRoom',
      'handleActivityAction'
    ]);
    this.state = {
      inputValue: ''
    };
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

  onInputChange(ref, e) {
    e.preventDefault();
    this.setState({
      inputValue: e.target.value
    });
  }

  handleMessageAction(data) {
    this.context.executeAction(handleMessageAction, data);
    this.setState({
      inputValue: ''
    });
  }

  deleteChatRoom() {
    const payload = {
      router: this.context.router,
      _id: this.props.store.chatRoomId
    };
    debug(payload);
    this.context.executeAction(deleteChatAction, payload);
  }

  handleActivityAction(data) {
    this.context.executeAction(handleActivityAction, data);
  }

  componentDidMount() {
    const socket = io(`/${this.props.store.chatRoomTitle}`);
    debug(socket);
    if (socket.disconnected) {

      socket.connect({forceNew: true});
    }
    const activitySocket = io();

    socket.on('chat', this.handleMessageAction);
    activitySocket.on('activity', this.handleActivityAction);

    this.interval = window.setInterval(() => {
      this.forceUpdate();
    }.bind(this), 10000);

    this.socket = socket;
    this.activitySocket = activitySocket;
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.socket.removeListener('chat', this.handleMessageAction);
    this.socket.disconnect();
    // this.activitySocket.disconnect();
    this.activitySocket.removeListener('activity', this.handleActivityAction);
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
          <input
            ref="content"
            type="text"
            onChange={this.onInputChange.bind(null, 'content')}
            value={this.state.inputValue} />
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
        <button onClick={this.deleteChatRoom}>Delete Chatroom</button>
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
