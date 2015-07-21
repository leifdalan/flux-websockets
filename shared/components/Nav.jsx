'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {Link} from 'react-router';
import classnames from 'classnames';
import {autoBindAll} from '../../utils';
import ChatLobby from './ChatLobby';
const debug = require('debug')('Component:Nav');
debug();

export default class Nav extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'mouseOverLink',
      'mouseOut'
    ]);
    this.state = {
      isHovering: false
    };
  }

  static displayName = 'Nav'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    loggedIn: pt.bool,
    userLevel: pt.number
  }

  mouseOverLink(e) {
    e.target.classList.add('hovering');
    this.setState({
      isHovering: true
    });
  }

  mouseOut(e) {
    e.target.classList.remove('hovering');
    this.setState({
      isHovering: false
    });
  }

  render() {
    const classes = classnames({
      'is-hovered': this.state.isHovering
    });
    const loggedInLinks =
    (
      <li onClick={this.props.onNavigation}>
        <Link
          onMouseOver={this.mouseOverLink}
          onMouseOut={this.mouseOut}
          to='/dashboard'>Profile
        </Link>
      </li>
    );
    const adminLink = (
      <li onClick={this.props.onNavigation}>
        <Link
          onMouseOver={this.mouseOverLink}
          onMouseOut={this.mouseOut}
          to='admin'>Admin
        </Link>
      </li>
    );

    return (
      <div className="main-nav">
        <ul className={classes}>
          <li onClick={this.props.onNavigation}>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='/'>Lobby
            </Link>
          </li>
          {!this.props.loggedIn &&
            <li onClick={this.props.onNavigation}>
              <Link
                onMouseOver={this.mouseOverLink}
                onMouseOut={this.mouseOut}
                to='signin'>SignIn
              </Link>
            </li>
          }
          {this.props.loggedIn && loggedInLinks}
          {this.props.userLevel > 1 && adminLink}
        </ul>
        {this.props.loggedIn &&
          <ChatLobby {...this.props} />
        }
      </div>
    );
  }
}
