'use strict';
import request from 'superagent';
import {trace, error as consoleError} from '../../utils';
const debug = require('debug')('Action:navigate');

export default function navigateAction({dispatch}, payload, done) {
  trace('Navigation trace');
  debug('Navigation Payload vvvvv');
  debug(payload);

  new Promise((resolve, reject) => {
    if (payload.preRender) {
      debug('PreRender data exists, attaching...');
      resolve(payload.preRender);
    } else {
      dispatch('REQUEST_START');
      request
        .get(payload.path)
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .end((xhrError, res) => {
          dispatch('REQUEST_END');
          const {error} = res;
          if (xhrError || res.badRequest) {
            debug(xhrError || res.badRequest);
            reject(xhrError || res.badRequest);
          } else {
            if (error) {
              debug('Navigation error');
              debug(error);
              reject(error);
            } else {
              debug('Navigation response:');
              debug(res);
              resolve(res);
            }
          }
      });
    }
  }).then((resolution) => {
    // dispatch('CHANGE_ROUTE', {payload, resolution});
    const activeRouteName = payload.routes[payload.routes.length - 1].name;
    debug(activeRouteName);
    // Create dynamic action based on path, dispatch with data.
    const dataAction = `${activeRouteName}_PAYLOAD`;

    dispatch(dataAction, resolution.body || resolution);

    // dispatch('LOAD_PAGE', payload);
    if (resolution.flashMessage) {
      dispatch('FLASH_MESSAGE', resolution.flashMessage);
    }
    if (resolution.reqAttempt) {
      dispatch('SAVE_REQUEST_ATTEMPT', resolution.reqAttempt);
    }
    if (resolution.appConfig) {
      dispatch('SAVE_APP_CONFIG', resolution.appConfig);
    }
    debug('chatrooms resolution');
    debug(resolution.chatRooms, resolution.body);
    dispatch('CHATROOM_PAYLOAD', resolution.chatRooms || resolution.body.chatRooms);
    done();
  }).catch((err) => {
    consoleError('Navigation error promise catch', err);
    dispatch('NAVIGATION_ERROR',
      `Oops, having problems navigating to ${payload.path}`
    );
  });
}
