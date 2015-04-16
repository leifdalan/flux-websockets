'use strict';
import React from 'react';
import Nav from './Nav';
import ApplicationStore from '../stores/ApplicationStore';
import {RouteHandler, Navigation} from 'react-router';
import {loginAction, logoutAction} from '../actions/authActions';
import clearRedirect from '../actions/clearRedirect';
import {FluxibleMixin} from 'fluxible';

const debug = require('debug')('Component:Application');

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore]
  },

  logout() {
    this.executeAction(logoutAction);
  },

  getInitialState() {
    return this.getStore(ApplicationStore).getState();
  },

  onChange() {
    var state = this.getStore(ApplicationStore).getState();

    if (state.redirect) {
      this.executeAction(clearRedirect);
      this.context.router.transitionTo(state.redirect);
    } else {
      this.setState(state);
    }
  },

  log() {
    const state = this.getStore(ApplicationStore).getState();
    debug(state);
  },

  render() {
    const loggedInForm = (
      <form action="/logout" method="POST">
        <button type="submit" onClick={this.logout}>Log out</button>
      </form>
    );

    return (
      <div>
        {this.state.flashMessage &&
          <div>{this.state.flashMessage}</div>
        }
        {this.state.appIsLoading &&
          <div>I'm loading!</div>
        }
        <Nav {...this.state} />
        <h1>Hello&nbsp;{this.state.email || 'Stranger'}</h1>
        {this.state.loggedIn &&
          <h2>You're user level is {this.state.userLevel}</h2>
        }
        <RouteHandler {...this.state} />
        {this.state.loggedIn && {loggedInForm}}

        <button onClick={this.log}>Log current application state</button>
      </div>
    );
  }
});
