'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {autoBindAll} from '../../../utils';
import classnames from 'classnames';
import {Link} from 'react-router';
const debug = require('debug')('Component:AdminLink');
debug();

export default class AdminNav extends Component {

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

  static displayName = 'AdminNav'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    onNavigation: pt.func
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

    return (
      <div className="main-nav">
        <ul className={classes}>
          <li onClick={this.props.onNavigation}>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='admin'>Admin
            </Link>
          </li>
          <li onClick={this.props.onNavigation}>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='adminUsersPaginated'
              params={{perpage: 20, pagenumber: 1}}
              >Users
            </Link>
          </li>
          <li onClick={this.props.onNavigation}>
            <Link
              onMouseOver={this.mouseOverLink}
              onMouseOut={this.mouseOut}
              to='/'>To Site
            </Link>
          </li>

        </ul>
      </div>
    );
  }
}
