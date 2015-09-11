'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {CheckLoginWillTransitionTo} from '../mixins/authMixins';
import DocumentTitle from 'react-document-title';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import Uploader from './Editor/Uploader';
import Picture from './Picture';
import {editUserAction} from '../actions/userActions';
const debug = require('debug')('Component:Dashboard');
debug();

class Dashboard extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'uploadCallback'
    ]);

  }

  static displayName = 'Dashboard'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired
  }

  static willTransitionTo = CheckLoginWillTransitionTo

  uploadCallback(payload) {
    debug(payload);
    debug('GENERIC RESPONSE');
    this.context.executeAction(editUserAction, {
      _id: this.props.store.userId,
      avatar: payload._id
    });
  }

  render() {
    debug(this.props.store);
    return (
      <DocumentTitle title="Dashboard">
        <div>
          <Uploader callback={this.uploadCallback} />
          {this.props.store.avatar &&
            <Picture mediaRecord={this.props.store.avatar} />
          }
        </div>
      </DocumentTitle>
    );
  }
}

Dashboard = connectToStores(Dashboard, ['ApplicationStore'], (stores) => {
  return {
    store: stores.ApplicationStore.getState()
  };
});

export default Dashboard;
