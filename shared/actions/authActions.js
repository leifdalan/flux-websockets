import request from 'superagent';
const debug = require('debug')('Action:authAction');

export const loginAction = (
  {dispatch}, {
    username,
    password,
    user,
    reqAttempt,
    router
  }, done) => {

  if (user) {
    debug('SETTING LOGIN STATE PASSED FROM SERVER');
    debug(user);
    dispatch('LOGIN', user);
  } else {
    request
      .post('/login')
      .send({username, password})
      .set('Accept', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
      .end((err, {body}) => {
        const {success, user: responseUser, message} = body;
        debug('RESPONSE?!');
        debug(err);
        // debug(success, responseUser);
        if (success) {
          dispatch('LOGIN', responseUser);
          router.transitionTo(reqAttempt || '/dashboard');
          dispatch('FLASH_MESSAGE', 'Welcome!');
        } else {
          dispatch('FLASH_MESSAGE', message);
        }

        window.socket.disconnect();
        window.socket.connect();
        done && done();
      }
    );
  }
};

export const logoutAction = ({dispatch}, {router}, done) => {
  debug('Logging out.');
  request
    .post('/logout')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .end((err, res) => {
      debug('Response:', res);
      dispatch('LOGOUT');
      router.transitionTo('/');
      dispatch('FLASH_MESSAGE', 'Come back soon!');
      window.socket.disconnect();
      window.socket.connect();
      done && done();
    }
  );
};

export const signUpAction = (
  {dispatch},
  {username, password, userLevel, router},
  done) => {
  debug('SignUpAction');
  request
    .post('/signup')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send({username, password, userLevel})
    .end((err, {body}) => {
      const {success, user, message} = body;
      debug('RESPONSE?!');
      debug(err);
      if (success) {
        dispatch('LOGIN', user);
        router.transitionTo('/dashboard');
        dispatch('FLASH_MESSAGE', 'Welcome to the site! Here\'s your dashboard.');
      } else {
        dispatch('FLASH_MESSAGE', message);
      }
      window.socket.disconnect();
      window.socket.connect();
      done && done();
    }
  );
};

export const changePasswordAction = (
  {dispatch},
  {password, router},
  done) => {
  debug('change password action');
  request
    .post('/passwordReset')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send({password})
    .end((err, {body}) => {
      const {success, message} = body;
      debug('RESPONSE?!');
      debug(err);
      if (success) {
        router.transitionTo('/dashboard');
        dispatch('FLASH_MESSAGE', 'Password Changed.');
      } else {
        dispatch('FLASH_MESSAGE', message);
      }
      done && done();
    }
  );
};
export const sendPasswordResetAction = (
  {dispatch},
  {username, router},
  done) => {
  debug('change password action');
  request
    .post('/sendPasswordReset')
    .set('Accept', 'application/json')
    .set('X-Requested-With', 'XMLHttpRequest')
    .send({username})
    .end((err, {body}) => {
      const {success, message} = body;
      debug('RESPONSE?!');
      debug(err);
      if (success) {
        router.transitionTo('/dashboard');
        dispatch('FLASH_MESSAGE', 'Password reset successfully sent.');
      } else {
        dispatch('FLASH_MESSAGE', message);
      }
      done && done();
    }
  );
};
