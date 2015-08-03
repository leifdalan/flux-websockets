'use strict';

import React, {Component, PropTypes as pt} from 'react';
import P from './P';
import Picture from '../Picture';
const debug = require('debug')('Component:Block');

debug();

class Block extends Component {

  constructor(props) {
    super(props);
  }

  static displayName = 'Block'

  static propTypes = {
    tag: pt.string.isRequired,
    text: pt.string.isRequired,
    handleFocus: pt.func.isRequired,
    index: pt.number,
    onFocusCallback: pt.func,
    onChangeCallback: pt.func
  }

  render() {
    let markup;
    switch (this.props.tag) {
      case 'p':
        markup = <P ref="asdf" {...this.props} />;
      break;
      case 'Picture':
        markup = (
          <Picture
            mediaRecord={this.props.mediaRecord}
            onClick={this.props.delete.bind(null, this.props.index)}
            {...this.props}
          />
        );
      break;
      default:
        markup = (
          <P
            text={this.props.text}
            {...this.props}
          />
        );
      break;
    }
    return markup;
  }
}

export default Block;
