import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import ApplicationStore from '../stores/ApplicationStore';
import UserStore from '../stores/UserStore';
import ChatStore from '../stores/ChatStore';
import {autoBindAll, expandedLog} from '../../utils';
import Nav from './Nav';
import AdminNav from './Admin/AdminNav';
import {RouteHandler} from 'react-router';
import {logoutAction} from '../actions/authActions';
import DocumentTitle from 'react-document-title';
import ReactSidebar from './Sidebar';
import classnames from 'classnames';
import Hamburger from './Hamburger';
import {
  clearFlashAction,
  storeSocketIdAction,
  flashMessageAction
} from '../actions/appActions';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';
const debug = require('debug')('Component:Application');
debug('Component:Application');

class Application extends Component {

  static displayName = 'Application'

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'logout',
      'clearFlash',
      'handleNavigation',
      'onSetSidebarOpen',
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
    appStore: pt.object.isRequired,
    chatStore: pt.object
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
    expandedLog(chatState);
    expandedLog(userState);
    expandedLog(state);
  }

  handleNavigation() {
    this.setState({sidebarOpen: false});
  }

  onSetSidebarOpen(open) {
    this.setState({sidebarOpen: open});
  }

  componentDidMount() {
    try {
      const socket = io();
      window.socket = socket;
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
        left: `${this.state.navLeft}`
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
        <AdminNav onNavigation={this.handleNavigation}
          {...this.props.appStore}
        /> :
        <Nav
          onNavigation={this.handleNavigation}
          {...this.props.appStore} />;
    const NavBar = (
      <nav
        handleClick={this.handleNavigation}
        className={navClass}
        style={navStyle}>
        {Navigation}
        <section className="user-list">
          <ul>
            {this.props.chatStore.connectedUsers.map((user) =>
              <li>{user}</li>
            )}
          </ul>

        </section>
        <footer>
          {this.state.userLevel > 1 &&
          <button
            key={`button${name}`}
            onClick={this.log}>
            Log current application state
          </button>
          }
          {this.state.loggedIn && loggedInForm}
        </footer>
      </nav>
    );

    return (
      <DocumentTitle title="Isomorphic Auth Flow">
        <div className="app">
          <Hamburger
            className="hamburger"
            showClose={this.state.sidebarOpen}
            handleClick={this.onSetSidebarOpen.bind(null, !this.state.sidebarOpen)}
            >0
          </Hamburger>
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

          <ReactSidebar
            sidebar={NavBar}
            open={this.state.sidebarOpen}
            onSetOpen={this.onSetSidebarOpen}>
            <div
              className="containerz"
              onTouchStart={this.handleTouchStart}
              onTouchMove={this.handleTouchMove}
              onTouchEnd={this.handleTouchEnd}
              >
              <section key={name} className="main-content" role="main">
                <RouteHandler key={name} {...this.state} />
              </section>

            </div>

          </ReactSidebar>

        </div>
      </DocumentTitle>
    );
  }
}

Application = connectToStores(Application, ['ApplicationStore', 'ChatStore'], (stores) => {
  return {
    appStore: stores.ApplicationStore.getState(),
    chatStore: stores.ChatStore.getState()
  };
});

export default Application;
