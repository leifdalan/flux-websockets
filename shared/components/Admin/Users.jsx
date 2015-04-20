'use strict';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import ApplicationStore from '../../stores/ApplicationStore';
import UserStore from '../../stores/UserStore';
import navigateAction from '../../actions/navigate';
import Paginator from './Paginator';
const debug = require('debug')('Component:Users');


export default React.createClass({
  displayName: 'Users',

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore, UserStore]
  },

  getInitialState() {
    let state = this.getStore(UserStore).getState();
    return state;
  },

  onChange() {
    const state = this.getStore(UserStore).getState();

    this.setState(state);
  },

  handleClick(id, e) {
    debug(id);
    debug(e);
  },

  handleEditClick(id, e) {
    e.preventDefault();
    this.context.router.transitionTo(`/admin/users/${id}`);
  },

  handleNumberInput(e) {
    this.setState({
      perPageInput: e.target.value
    });
  },

  handleButton(e) {
    e.preventDefault();
    const perpage = this.state.perPageInput || this.state.perpage;
    this.context.router.transitionTo(
      `/admin/users/page/${perpage}/1`
    );
  },

  render() {
    const paginator = (
      <Paginator
        currentPageNumber={this.state.currentPageNumber}
        totalItems={this.state.totalUsers}
        perpage={this.state.perpage}
        neighborDepth={1}
        pathBase="/admin/users/page/"
      />
    );

    return (
      <div>
        <h1>Users</h1>
        <input
          type="number"
          onChange={this.handleNumberInput}
          value={this.state.perPageInput}
          placeholder={`Items per page (${this.state.perpage})`}
        />
      <button
        onClick={this.handleButton}>
        Update Items/page
      </button>

        {paginator}
        {this.state.users.map(
          (user, index) =>
          <div
            key={user._id}
            index={index}
            onClick={this.handleClick.bind(this, user._id)}>

            <h2>{user.local.email}</h2>
            <p>User level: {user.userLevel}</p>
            <button
              className="button-primary"
              onClick={this.handleEditClick.bind(this, user._id)}>
              Edit
            </button>
          </div>
          )
        }
        {paginator}
      </div>
    );
  }
})