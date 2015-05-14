'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {connectToStores} from 'fluxible/addons';
import {sendMessageAction} from '../actions/chatActions';
import {autoBindAll} from '../../utils';
const debug = require('debug')('Component:ChatRoom');
debug();

class ChatRoom extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'submitChat'
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

  submitChat(e) {
    e.preventDefault();
    const content = findDOMNode(this.refs.content).value;
    debug('content', content);
    const user = this.props.appStore.userId;
    this.context.executeAction(sendMessageAction, {content, user});
  }

  // sendMessage(msg) {
  //
  // }

  render() {
    return (
      <div>
        {this.props.store.chats.map((chat, i) =>
          <div key={`chat${i}`}>{chat.user ? chat.user.name : 'Anon'}: {chat.content}</div>
        )}

        <form onSubmit={this.submitChat}>
          <input ref="content" type="text" />
          <button type="submit">Submit</button>
        </form>
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
