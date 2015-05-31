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
        dispatch('LOGIN', response.body);
      });
  }
  done();
  // request
  //   .post(`/dashboard`)
  //   .type('multipart/form-data')
  //   .attach('image', payload)
  //   .end((xhrError, res) => {
  //     const {success, chatroom, error} = res.body;
  //     if (xhrError || res.badRequest) {
  //       debug(xhrError || res.badRequest);
  //       dispatch('FLASH_MESSAGE', 'Bad Request.');
  //     } else {
  //       if (success) {
  //         debug('HUH?', res.body);
  //       } else if (error) {
  //         debug(error);
  //       }
  //     }
  //     done && done();
  //   }
  // );
};
