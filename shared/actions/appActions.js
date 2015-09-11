import request from 'superagent';
const debug = require('debug')('Actions:AppActions');


export const flashMessageAction = ({dispatch}, payload, done) => {
  dispatch('FLASH_MESSAGE', payload);
  done();
};

export const storeSocketIdAction = ({dispatch}, payload, done) => {
  dispatch('STORE_SOCKET_ID', payload);
  done();
};


export const setPageUserPrefAction = ({dispatch}, payload, done) => {
  dispatch('SET_PAGE_USER_PREF', payload);
  done();
};

export const clearFlashAction = ({dispatch}, payload, done) => {
  dispatch('CLEAR_FLASH_MESSAGE');
  done();
};

export const uploadFileAction = ({dispatch}, payload, done) => {
  dispatch('UPLOAD_FILE');
  debug(payload);
  var xhr = new window.XMLHttpRequest();

  function sendToS3(res) {
    debug('sending to s3');
    debug(res);
    res.socketId = payload.socketId;

    request
      .post('/s3')
      .set('Accept', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send(res)
      .end((err, response) => {
        debug(err);

        debug(response);
        payload.callback(response.body);
      });
  }

  xhr.open('POST', '/upload', true);
  xhr.setRequestHeader('X-SocketId', payload.socketId);
  xhr.onreadystatechange = function (e) {
    debug('onready', e);
    if (xhr.readyState === 4) {
       if (xhr.status === 200) {
         debug();
         sendToS3(JSON.parse(xhr.responseText));
       } else {
         dispatch('FLASH_MESSAGE', JSON.parse(xhr.responseText).message);
       }
    }
  };
  xhr.onload = (e) => {
    debug(e);
    debug('ALL done!!!');
  };
  xhr.send(payload.formData);
  debug(payload);
  done();
};
