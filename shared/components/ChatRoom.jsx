'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import DocumentTitle from 'react-document-title';
import {connectToStores} from 'fluxible/addons';
import {sendMessageAction} from '../actions/chatActions';
import {autoBindAll} from '../../utils';
import {
  handleMessageAction,
  handleActivityAction,
  deleteChatAction,
  flashActivityAction
} from '../actions/chatActions';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import {getTimeAgo} from '../../utils';
import {includes, pull, clone} from 'lodash';
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
      'handleTyping',
      'handleActivityAction'
    ]);
    this.state = {
      inputValue: '',
      typing: []
    };
    this._lastMessageCount = props.store.chats.length;
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
    this.socket.emit('typing', {
      user: this.props.appStore.user.local.username,
      typing: true
    });
  }

  handleMessageAction(data) {
    this._lastMessageCount = this.props.store.chats.length;
    this.context.executeAction(handleMessageAction, data);
  }

  handleTyping(payload) {
    let typing = clone(this.state.typing);
    if (payload.typing) {
      if (!includes(typing, payload.user)) {
        typing.push(payload.user);
      }
    } else {
      pull(typing, payload.user);
    }

    this.setState({typing});
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
    this.context.executeAction(flashActivityAction, data);
  }

  componentDidMount() {
    const socket = io(`/${this.props.store.chatRoomTitle}`);

    if (socket.disconnected) {
      debug('FORCING NEW');
      socket.connect({forceNew: true});
    }

    const activitySocket = io();

    // bind sockets
    socket.on('chat', this.handleMessageAction);
    activitySocket.on('activity', this.handleActivityAction);
    socket.on('typing', this.handleTyping);

    // set interval
    this.interval = window.setInterval(() => {
      this.forceUpdate();
    }.bind(this), 10000);

    this.socket = socket;
    this.activitySocket = activitySocket;
    const chatbody = this.refs.chatBody.getDOMNode();
    chatbody.scrollTop = chatbody.scrollHeight;
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.socket.removeListener('chat', this.handleMessageAction);
    this.socket.disconnect();
    this.activitySocket.removeListener('activity', this.handleActivityAction);
  }

  componentDidUpdate() {
    debug('componentDidUpdate');
    debug(this._lastMessageCount);
    debug(this.props.store.chats.length);
    if (this._lastMessageCount !== this.props.store.chats.length) {
      this._lastMessageCount = this.props.store.chats.length;
      const chatbody = this.refs.chatBody.getDOMNode();
      chatbody.scrollTop = chatbody.scrollHeight;
    }
  }

  submitChat(e) {
    e.preventDefault();
    const content = findDOMNode(this.refs.content).value;
    const user = this.props.appStore.userId;
    const channel = `/${this.props.store.chatRoomTitle}`;
    this.context.executeAction(sendMessageAction, {content, user, channel});
    this.socket.emit('typing', {
      user: this.props.appStore.user.local.username,
      typing: false
    });
    this.setState({
      inputValue: ''
    });
  }

  render() {
    let typingMarkup;
    switch (this.state.typing.length) {
      case 1:
        typingMarkup = <div className="istyping">{this.state.typing[0]} is typing...</div>;
      break;
      case 2:
        typingMarkup = (
          <div className="istyping">
            {this.state.typing[0]} and {this.state.typing[1]} are typing...
          </div>
        );
      break;
      default:
        typingMarkup = (
          <div className="istyping">
            Many are typing...
          </div>
        );
      break;
    }

    return (
      <DocumentTitle title={this.props.store.chatRoomTitle}>
        <div className="chatroom-container">
          <h1>{this.props.store.chatRoomTitle}</h1>

          {this.state.typing.length ? typingMarkup : ''}

          <TransitionGroup component="div" transitionName="example">
            <section ref="chatBody" className="chat-body">
              {this.props.store.chats.map((chat, i) =>
                <div className="chat-message" key={`chat${i}`}>
                  <div className="body">{chat.user ? chat.user.local.username : 'Anon'}: {chat.content}</div>
                  <div className="time">{getTimeAgo(chat.created)}</div>
                </div>
              )}
            </section>
          </TransitionGroup>
          <form onSubmit={this.submitChat}>
            <input
              ref="content"
              type="text"
              onChange={this.onInputChange.bind(this, 'content')}
              value={this.state.inputValue} />
            <button type="submit">Submit</button>
          </form>

        </div>
    </DocumentTitle>
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
