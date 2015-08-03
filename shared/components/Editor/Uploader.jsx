'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../../utils';
import {uploadFileAction} from '../../actions/appActions';
const debug = require('debug')('Component:Uploader');
debug();

class Uploader extends Component {

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
      totalProgress: 0,
      isUploading: false
    };

  }

  static displayName = 'Uploader'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired,
    callback: pt.func.isRequired
  }

  uploadFile() {
    this.setState({
      isUploading: true
    });
    const formData = new window.FormData();
    const file = this.refs.file.getDOMNode().files[0];
    const socketId = this.props.store.socketId;
    const callback = this.props.callback;
    formData.append('image', this.refs.file.getDOMNode().files[0]);
    formData.append('socketId', socketId);
    this.context.executeAction(uploadFileAction, {
      formData,
      socketId,
      callback
    });

    if (typeof FileReader !== 'undefined' && (/image/i).test(file.type)) {
      let img = window.document.createElement('img');
      const reader = new window.FileReader();
      reader.onload = (() => {
        return function (evt) {
          this.setState({
            previewImageSrc: evt.target.result
          });
        }.bind(this);

      }.bind(this))(img);

      reader.readAsDataURL(file);
    }
  }

  handleProgress(key, value) {
    debug('key', key);
    debug('value', value);
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

    debug('totalProgress / subProgresses', totalProgress / subProgresses);
    debug('this._progress', this._progress);
    if (Math.round(totalProgress / subProgresses) === 1) {
      this.setState({
        isUploading: false
      });
    }
  }

  componentDidMount() {
    const activitySocket = io();
    activitySocket.on('progress', this.handleProgress.bind(this));
  }

  render() {
    return (
      <div className="uploader">
        {this.state.isUploading &&
          <figure>
            <figcaption
              style={{
                height: `${this.state.totalProgress * 100}%`,
                background: 'red'
              }}
              >{Math.round(this.state.totalProgress * 100)}
            </figcaption>
            <img src={this.state.previewImageSrc} />
          </figure>
        }


         <input type="file" ref="file" name="filefield" onChange={this.uploadFile}/><br />
         <input type="submit" />
      </div>
    );
  }
}

Uploader = connectToStores(Uploader, ['ApplicationStore'], (stores) => {
  return {
    store: stores.ApplicationStore.getState()
  };
});

export default Uploader;
