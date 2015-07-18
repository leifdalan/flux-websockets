'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {autoBindAll} from '../../utils';
import classnames from 'classnames';
const debug = require('debug')('Component:Hamburger');
debug();

class Hamburger extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'sendClick'
    ]);
    this.state = {
      showClose: false
    };
  }

  static displayName = 'Hamburger'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired,
    handleClick: pt.func,
    showClose: pt.bool
  }

  render() {
    const className = classnames({
      hamburger: true,
      open: this.props.showClose
    });
    /*eslint-disable*/
    return (
      <button
        className={className}
        onClick={this.props.handleClick}
        dangerouslySetInnerHTML={{__html: `
        <svg class="inline-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="60px" height="40px" viewBox="0 0 32 22.5" enable-background="new 0 0 32 22.5" xml:space="preserve">
          <title>Mobile Menu</title>
          <g class="svg-menu-toggle">

          <path class="bar" d="M20.945,8.75c0,0.69-0.5,1.25-1.117,1.25H3.141c-0.617,0-1.118-0.56-1.118-1.25l0,0
            c0-0.69,0.5-1.25,1.118-1.25h16.688C20.445,7.5,20.945,8.06,20.945,8.75L20.945,8.75z">
          </path>
          <path class="bar" d="M20.923,15c0,0.689-0.501,1.25-1.118,1.25H3.118C2.5,16.25,2,15.689,2,15l0,0c0-0.689,0.5-1.25,1.118-1.25 h16.687C20.422,13.75,20.923,14.311,20.923,15L20.923,15z">
          </path>
          <path class="bar" d="M20.969,21.25c0,0.689-0.5,1.25-1.117,1.25H3.164c-0.617,0-1.118-0.561-1.118-1.25l0,0
            c0-0.689,0.5-1.25,1.118-1.25h16.688C20.469,20,20.969,20.561,20.969,21.25L20.969,21.25z">
          </path>
          <!-- needs to be here as a 'hit area' -->
          <rect width="60" height="40" fill="none">

          </rect>
          </g>

        </svg>
      `}}>
      </button>
    );
    /*eslint-enable*/
  }
}

export default Hamburger;
