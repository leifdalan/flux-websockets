'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import {changePasswordAction} from '../actions/authActions';
const debug = require('debug')('Component:PasswordReset');
debug();

class PasswordReset extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'onSubmit'
    ]);
  }

  static displayName = 'PasswordReset'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired
  }

  onSubmit(e) {
    e.preventDefault();
    this.context.executeAction(changePasswordAction, {
      password: findDOMNode(this.refs.password).value,
      router: this.context.router
    });
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" name="password" ref="password" />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

PasswordReset = connectToStores(PasswordReset, ['ApplicationStore'], (stores) => {
  return {
    store: stores.ApplicationStore.getState()
  };
});

export default PasswordReset;
