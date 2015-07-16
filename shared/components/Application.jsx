'use strict';
import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../stores/ApplicationStore';
import UserStore from '../stores/UserStore';
import ChatStore from '../stores/ChatStore';
import {autoBindAll} from '../../utils';
import Nav from './Nav';
import AdminNav from './Admin/AdminNav';
import {RouteHandler} from 'react-router';
import {logoutAction} from '../actions/authActions';
import DocumentTitle from 'react-document-title';
import ReactGestures from 'react-gestures';
import classnames from 'classnames';
import {
  clearFlashAction,
  storeSocketIdAction,
  flashMessageAction
} from '../actions/appActions';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import Picture from './Picture';
const debug = require('debug')('Component:Application');

class Application extends Component {

  static displayName = 'Application'

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'logout',
      'adjustNavLeft',
      'clearFlash',
      'handleTouchEnd',
      'log'
    ]);
    this.state = props.appStore;
    this.state.navLeft = 0;
  }

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    appStore: pt.object.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const newState = nextProps.appStore;
    if (this.state.flashMessage !== newState.flashMessage) {
      this._flashTimeout && clearTimeout(this._flashTimeout);
      this._flashTimeout = setTimeout(() => {
        this.clearFlash();
      }, 5000);
    }
    this.setState(newState);
  }

  logout(e) {
    e.preventDefault();
    const {router} = this.context;
    this.context.executeAction(logoutAction, {router});
  }

  clearFlash(e) {
    e && e.preventDefault();
    this._flashTimeout && clearTimeout(this._flashTimeout);
    this.context.executeAction(clearFlashAction);
  }

  log() {
    const state = this.context.getStore(ApplicationStore).getState();
    const userState = this.context.getStore(UserStore).getState();
    const chatState = this.context.getStore(ChatStore).getState();
    debug(chatState);
    debug(userState);
    debug(state);
  }

  adjustNavLeft(e) {
    debug(e);
    const scaled = e.gesture.deltaX / 4;
    const isTouching = true;
    let navLeft = scaled > 90 ? 90 : scaled;
    navLeft = navLeft < 0 ? 0 : navLeft;

    this.setState({navLeft, isTouching});
    if (e.gesture.done) {
      this.handleTouchEnd();
    }
  }

  handleTouchEnd() {
    debug('TouchEnd', this.state.navLeft);
    if (Math.abs(this.state.navLeft) > 45) {
      this.setState({
        navIsOpen: true,
        isTouching: false
      });
    } else {
      this.setState({
        isTouching: false,
        navIsOpen: false
      });

    }
  }

  componentDidMount() {
    try {
      const socket = io();
      socket.on('id', (payload) => {
        this.context.executeAction(storeSocketIdAction, payload);
      });
    } catch (e) {
      this.context.executeAction(
        flashMessageAction,
        'A realtime connection could not be established.'
      );
    }
  }

  render() {
    let navStyle = {};
    const name = this.context.router.getCurrentPath();
    const navClass = classnames({
      navigation: true,
      'open': this.state.navIsOpen
    });
    if (this.state.isTouching) {
      navStyle = {
        transform: `rotateY(-${this.state.navLeft}deg)`
      };
    } else {
      navStyle = {
        display: 'block'
      };
    }

    const loggedInForm = (
      <form key={`form${name}`} action="/logout" method="POST">
        <button type="submit" onClick={this.logout}>Log out</button>
      </form>
    );

    const Navigation =
      this.state.userLevel > 1 && name.split('/')[1] === 'admin' ?
        <AdminNav {...this.props.appStore} /> :
        <Nav {...this.props.appStore} />;

    return (
      <DocumentTitle title="Isomorphic Auth Flow">
        <div className="app">
          <button className="hamburger">0</button>
          <TransitionGroup component="div" transitionName="go-away">
            {this.state.flashMessage &&
              <button
                key="flashMessage"
                ref="flashMessage"
                onClick={this.clearFlash}
                className="u-full-width button button-prima2y flash">
                {this.state.flashMessage}
              </button>
            }
          </TransitionGroup>

          <TransitionGroup component="div" transitionName="app-load">
            {this.props.appStore.appIsLoading &&
              <div
                className="load-bar"
                key="loading-bar">
              </div>
            }
          </TransitionGroup>
          <ReactGestures
            onSwipeRight={this.adjustNavLeft}
            onSwipeLeft={this.adjustNavLeft}
            swipeThreshold={3}
            onTouchEnd={this.handleTouchEnd}>
            <div className="containerz">
              <nav
                className={navClass}
                style={navStyle}>
                {Navigation}
              </nav>
              <section key={name} className="main-content" role="main">
                <RouteHandler key={name} {...this.state} />
              </section>

            </div>
          </ReactGestures>
          <footer>
            <button
              key={`button${name}`}
              onClick={this.log}>
              Log current application state
            </button>
            {this.state.loggedIn && loggedInForm}
          </footer>
        </div>
      </DocumentTitle>
    );
  }
}

Application = connectToStores(Application, ['ApplicationStore'], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState()
  };
});

export default Application;
