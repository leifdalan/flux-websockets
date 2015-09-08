'use strict';
import {BaseStore} from 'fluxible/addons';
import {pull} from 'lodash';
const debug = require('debug')('Store:ApplicationStore');

export default class ApplicationStore extends BaseStore {

  constructor(dispatcher) {
    super(dispatcher);
    this.pages = [];
    this.totalPages = null;
    this.singlePage = null;
    this.search = null;
    this.currentPageNumber = null;
    this.perpage = null;
    this.pageAdjustment = null;
    this._lastValidSinglePage = null;
    this.socketId = null;
    this.progressTitle = null;
    this.progress = null;
    this.showProgress = null;
    this.avatar = null;
    this.appConfig = null;
  }

  static storeName = 'ApplicationStore'

  static handlers = {
    'CHANGE_ROUTE': 'handleNavigate',
    'LOGIN': 'login',
    'LOGOUT': 'logout',
    'REQUEST_START': 'requestStart',
    'REQUEST_END': 'requestEnd',
    'NAVIGATION_ERROR': 'navigationError',
    'FLASH_MESSAGE': 'setFlashMessage',
    'CLEAR_FLASH_MESSAGE': 'clearFlashMessage',
    'SET_PAGE_USER_PREF': 'setPageUserPref',
    'SAVE_REQUEST_ATTEMPT': 'saveRequestAttempt',
    'IN_PAGE_REQUEST_START': 'inPageRequestStart',
    'IN_PAGE_REQUEST_END': 'inPageRequestEnd',
    'STORE_SOCKET_ID': 'storeSocketId',
    'SAVE_APP_CONFIG': 'saveAppConfig'
  }

  navigationError(payload) {
    this.setRedirect({
      url: '/',
      flashMessage: payload
    });
  }

  initialize() {
    this.currentRoute = null;
    this.loggedIn = false;
    this.email = null;
    this.userId = null;
    this.redirect = null;
    this.appIsLoading = null;
    this.flashMessage = null;
    this.reqAttempt = null;
    this.userLevel = null;
    this.inPageLoadingProperties = [];
    this.pageUserPref = null;
    this.socketId = null;
  }

  saveAppConfig(payload) {
    debug('saving app config:', payload);
    this.appConfig = payload;
    this.emitChange();
  }

  storeSocketId(payload) {
    debug('Storing socket it', payload);
    this.socketId = payload;
    this.emitChange();
  }

  setPageUserPref({route, preference}) {
    this.pageUserPref = {
      [route]: preference
    };
    this.emitChange();
  }

  saveRequestAttempt(message) {
    this.reqAttempt = message;
  }

  setFlashMessage(message) {
    if (message instanceof Array) {
      message = message[0];
    }
    this.flashMessage = message;
    this.emitChange();
  }

  clearFlashMessage() {
    this.flashMessage = null;
    this.emitChange();
  }

  requestStart() {
    this.appIsLoading = true;
    this.emitChange();
  }

  requestEnd() {
    this.appIsLoading = false;
    this.emitChange();
  }

  handleNavigate({payload: route, resolution}) {
    this.appIsLoading = false;
    debug('HANDLING NAVIGATE vvvvvvv');
    debug(route, resolution);
    if (this.currentRoute && route.path === this.currentRoute.path) {
      debug('Attempted to navigate to the same path.');
      return;
    }

    // this.currentRoute = route;
    this.emitChange();
  }

  login({userLevel = 1, local, _id, avatar}) {
    debug('logging in', _id);
    debug('AVATAR');
    debug(avatar);
    this.loggedIn = true;
    this.email = local.email;
    this.userLevel = userLevel;
    this.userId = _id;
    this.avatar = avatar;
    this.emitChange();
  }

  logout() {
    this.loggedIn = false;
    this.email = null;
    this.userLevel = null;
    this.emitChange();
  }

  inPageRequestStart(payload) {
    this.inPageLoadingProperties = this.inPageLoadingProperties || [];
    this.inPageLoadingProperties.push(payload);
    this.emitChange();
  }

  inPageRequestEnd(payload) {
    pull(this.inPageLoadingProperties, payload);
    this.emitChange();
  }

  getState() {
    return {
      route: this.currentRoute,
      loggedIn: this.loggedIn,
      socketId: this.socketId,
      email: this.email,
      avatar: this.avatar,
      userLevel: this.userLevel,
      userId: this.userId,
      appIsLoading: this.appIsLoading,
      flashMessage: this.flashMessage,
      pageUserPref: this.pageUserPref,
      inPageLoadingProperties: this.inPageLoadingProperties,
      reqAttempt: this.reqAttempt,
      progressTitle: this.progressTitle,
      progress: this.progress,
      appConfig: this.appConfig,
      showProgress: this.showProgress
    };
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.currentRoute = state.route;
    this.loggedIn = state.loggedIn;
    this.socketId = state.socketId;
    this.email = state.email;
    this.userLevel = state.userLevel;
    this.appIsLoading = state.appIsLoading;
    this.userId = state.userId;
    this.flashMessage = state.flashMessage;
    this.pageUserPref = state.pageUserPref;
    this.inPageLoadingProperties = state.inPageLoadingProperties;
    this.reqAttempt = state.reqAttempt;
    this.progressTitle = state.progressTitle;
    this.progress = state.progress;
    this.avatar = state.avatar;
    this.appConfig = state.appConfig;
    this.showProgress = state.showProgress;
  }
}
