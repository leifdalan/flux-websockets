import request from 'superagent';
const debug = require('debug')('Actions:MessageActions');
export const sendMessageAction = ({dispatch}, payload, done) => {
  debug(payload.channel);
  const socket = io(payload.channel);
  debug(`emitting chat on ${payload.channel} and saying ${payload.content}`);
  socket.emit('chat', payload);
  done();
};

export const handleMessageAction = ({dispatch}, payload, done) => {
  dispatch('RECEIVED_MESSAGE', payload);
  done();
};
export const handleActivityAction = ({dispatch}, payload, done) => {
  dispatch('RECEIVED_ACTIVITY', payload);
  dispatch('FLASH_MESSAGE', payload.activity);
  debug(payload);
  done();
};

export const createChatAction = ({dispatch}, payload, done) => {
  debug(payload);
  dispatch('REQUEST_START');
  request
    .post(`/chat`)
    .send({title: payload.title})
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      dispatch('REQUEST_END');
      const {success, chatroom, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          dispatch('CREATE_CHATROOM', chatroom);
          dispatch('FLASH_MESSAGE', 'Created Chat!');
          payload.router.transitionTo(`/chat/${chatroom._id}`);
        } else if (error) {
          dispatch('CREATE_CHATROOM_FAILURE', error);
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
export const deleteChatAction = ({dispatch}, payload, done) => {
  debug(payload);
  dispatch('REQUEST_START');
  request
    .del(`/chat/${payload._id}`)
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((xhrError, res) => {
      dispatch('REQUEST_END');
      const {success, error} = res.body;
      if (xhrError || res.badRequest) {
        debug(xhrError || res.badRequest);
        dispatch('FLASH_MESSAGE', 'Bad Request.');
      } else {
        if (success) {
          dispatch('FLASH_MESSAGE', 'Deleted Chat!');
          payload.router.transitionTo(`/chat`);
        } else if (error) {
          dispatch('FLASH_MESSAGE', error);
        }
      }
      done && done();
    }
  );
};
