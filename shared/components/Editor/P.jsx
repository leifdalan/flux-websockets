'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {setFocusAction, setContentAction} from '../../actions/editorActions';
import {autoBindAll} from '../../../utils';
import Picture from '../Picture';
const debug = require('debug')('Component:Paragraph');
debug();

class Paragraph extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'onFocus',
      'onChange'
    ]);
  }

  static displayName = 'Paragraph'

  static contextTypes = {
    router: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired,
    focused: pt.bool
  }

  onFocus() {
    debug('i got focuesed');
    this.props.onFocusCallback(this.props.index);
    this.context.executeAction(setFocusAction, {
      index: this.props.index,
      blockId: this.props.blockId
    });
  }

  onChange(e) {
    debug(e);
    debug('Changing...', this.props.index);
    if (e.keyCode !== 13) {
      this.context.executeAction(setContentAction, {
        index: this.props.index,
        blockId: this.props.blockId,
        content: React.findDOMNode(this).innerHTML
      });
      debug(React.findDOMNode(this).innerHTML);
      this.props.onChangeCallback(this.props.index, this.props.blockId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focused !== this.props.focused ||
        prevProps.tag !== this.props.tag) {
      this.props.focused && React.findDOMNode(this).focus();
    }
  }

  componentDidMount() {
    debug('Mounting', this.props.tag);
    this.props.focused && React.findDOMNode(this).focus();
  }

  render() {
    debug('rendering block');
    if (this.props.tag === 'Picture') {
      return (
        <Picture mediaRecord={this.props.mediaRecord} />
      );
    }
    if (this.props.tag === 'ul') {
        return (
          <ul>
            <li
              contentEditable
              dangerouslySetInnerHTML={{__html: this.props.content || ''}}>
            </li>
          </ul>
        );
    }
    return (
      <this.props.tag
        onFocus={this.onFocus}
        contentEditable
        tabIndex="-1"
        onInput={this.onChange}
        dangerouslySetInnerHTML={{__html: this.props.content || ''}}
      />
    );
  }
}

export default Paragraph;
