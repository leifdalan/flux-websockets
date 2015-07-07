'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import {throttle} from 'lodash';
import classnames from 'classnames';

const debug = require('debug')('Component:Picture');
debug();

class Picture extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'debouncedScroll',
      'removeListener',
      'waitForLoad'
    ]);

    this.state = {
      isVisible: false,
      isLoaded: false
    };
  }

  static displayName = 'Picture'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    mediaRecord: pt.object.isRequired,
    store: pt.object.isRequired,
    onClick: pt.func
  }

  componentDidMount() {
    const DOMNode = React.findDOMNode(this);
    debug('Width of thing ==', DOMNode.clientWidth);
    const boundFunc = this.debouncedScroll.bind(this, DOMNode);
    this.throttled = throttle(boundFunc, 250);
    window.addEventListener('scroll', this.throttled, false);
    window.addEventListener('resize', this.throttled, false);
    this.throttled();
  }

  debouncedScroll(DOMNode) {

    if (DOMNode.getBoundingClientRect().top < window.innerHeight) {
      this.setState({
        isVisible: true
      }, this.waitForLoad);

      window.picturefill({
        elements: [
          React.findDOMNode(this)
        ]
      });

      this.removeListener();
    }
  }

  waitForLoad() {
    React.findDOMNode(this.refs.image).onload = () => {
      this.setState({
        isLoaded: true
      });
    };
  }

  removeListener() {
    window.removeEventListener('scroll', this.throttled, false);
    window.removeEventListener('resize', this.throttled, false);
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    const pre = `http://${this.props.store.appConfig.bucket}`;
    const {
      original,
      mobile,
      medium,
      retina,
      mobileWebp,
      mediumWebp,
      retinaWebp,
      alt
    } = this.props.mediaRecord;
    const ratio = original.height / original.width * 100;
    const classes = classnames({
      'picture-figure': true,
      'loaded': this.state.isLoaded,
      'loading': this.state.isVisible && !this.state.isLoaded
    });
    return (
      <figure
        className={classes}
        style={{
          width: '100%',
          paddingBottom: `${ratio}%`
        }}
        onClick={this.props.onClick}
      >
        {this.state.isVisible &&
          <picture
            data-width={original.width}
            data-height={original.height}
            >
            {/*eslint-disable*/}
            <source
              srcSet={`${pre}${mobileWebp.filename}, ${pre}${mediumWebp.filename} 2x`}
              media="(max-width: 480px)"
              type="image/mwebp"
            />
            <source
              srcSet={`${pre}${mobile.filename}, ${pre}${medium.filename} 2x`}
              media="(max-width: 480px)"
              type="image/jpg"
            />
            <source
              srcSet={`${pre}${mediumWebp.filename}, ${pre}${retinaWebp.filename} 2x`}
              type="image/webp"
            />
            <source
              srcSet={`${pre}${medium.filename}, ${pre}${retina.filename} 2x`}
              type="image/jpg"
            />

            <img
              srcSet={`${pre}${medium.filename}, ${pre}${retina.filename} 2x`}
              alt={alt}
              ref="image" />
            {/*eslint-enable*/}
          </picture>
        }
      </figure>
    );
  }
}

Picture = connectToStores(Picture, ['ApplicationStore'], (stores) => {
  return {
    store: stores.ApplicationStore.getState()
  };
});

export default Picture;
