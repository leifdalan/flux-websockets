'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {CheckLoginWillTransitionTo} from '../mixins/authMixins';
import DocumentTitle from 'react-document-title';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import {uploadFileAction} from '../actions/appActions';
const debug = require('debug')('Component:Dashboard');
debug();

class Dashboard extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'uploadFile',
      'handleProgress',
      'calculateProgress'
    ]);
    this._progress = {
      clientUpload: 0,
      cloudStream: 0,
      cloudRes0: 0,
      cloudRes1: 0,
      cloudRes2: 0
    };
    this.state = {
      totalProgress: 0
    };
  }

  static displayName = 'Dashboard'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired
  }

  static willTransitionTo = CheckLoginWillTransitionTo

  uploadFile() {
    const formData = new window.FormData();
    debug(this.refs.file.getDOMNode().files);
    formData.append('image', this.refs.file.getDOMNode().files[0]);
    const file = this.refs.file.getDOMNode().files[0];
    const socketId = this.props.store.socketId;
    formData.append('socketId', socketId);
    debug(formData);
    debug(this.props.store.email);
    this.context.executeAction(uploadFileAction, {
      formData,
      socketId
    });

    if (typeof FileReader !== 'undefined' && (/image/i).test(file.type)) {
      let img = window.document.createElement('img');
      const reader = new window.FileReader();
      reader.onload = (function (theImg) {
        return function (evt) {
          debug(this);
          this.setState({
            previewImageSrc: evt.target.result
          });
          debug(evt.target.result);
        }.bind(this);

      }.bind(this))(img);

      reader.readAsDataURL(file);
    }
  }

  handleProgress(key, value) {
    debug('PROGRESS', this._progress);
    debug(key, value);
    this._progress[key] = value;
    this.calculateProgress();
  }

  calculateProgress() {
    const subProgresses = Object.keys(this._progress).length;
    let totalProgress = 0;
    Object.keys(this._progress).forEach((key) => {
      totalProgress += this._progress[key];
    }.bind(this));
    this.setState({
      totalProgress: totalProgress / subProgresses
    });
    debug(totalProgress / subProgresses);
  }

  componentDidMount() {
    const activitySocket = io();

    activitySocket.on('progress', this.handleProgress.bind(this));
  }

  render() {
    return (
      <DocumentTitle title="Dashboard">
        <div>
          <p>Here's your dashboard!</p>
            <figure>
              <figcaption
                style={{
                  width: `${this.state.totalProgress * 100}%`,
                  background: 'red',
                  'float': 'left'
                }}
                >{this.state.totalProgress}
              </figcaption>
              <img src={this.state.previewImageSrc} />
            </figure>
            <form method="POST" encType="multipart/form-data">
             <input type="file" ref="file" name="filefield" onChange={this.uploadFile}/><br />
             <input type="submit" />
            </form>
          </div>
      </DocumentTitle>
    );
  }
}

Dashboard = connectToStores(Dashboard, ['ApplicationStore'], (stores) => {
  return {
    store: stores.ApplicationStore.getState()
  };
});

export default Dashboard;
