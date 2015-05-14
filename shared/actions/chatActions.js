const debug = require('debug')('Actions:MessageActions');
export const sendMessageAction = ({dispatch}, payload, done) => {
  const socket = io();
  socket.emit('chat', payload);
  done();
};

export const handleMessageAction = ({dispatch}, payload, done) => {
  dispatch('RECEIVED_MESSAGE', payload);
  done();
};
