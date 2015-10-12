'use strict';

import React, {Component, PropTypes as pt, findDOMNode} from 'react';
import {autoBindAll} from '../../../../utils';
import {merge} from 'lodash';
import Block from '../../Editor/Block';
import Uploader from '../../Editor/Uploader';
import {connectToStores} from 'fluxible/addons';
import {
  addBlockAction,
  changeBlockAction,
  deleteBlockAction
} from '../../../actions/editorActions';
const debug = require('debug')('Component:PageForm');
debug();

class PageForm extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleSubmit',
      'handleChange',
      'onEdit',
      'focusBlock',
      'onKeyDown',
      'insertPicture',
      'exec',
      'changeBlock',
      'onFocusCallback',
      'onChangeCallback',
      'deleteBlock',
      'log'
    ]);

    this.counter = 0;
    this.state = props;
    this.state.content = this.state.content || '';
    this.state.currentFocusedBlockIndex = 0;
    this.state.blocks = [this.defaultBlock];
  }

  static displayName = 'PageForm'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    handleSubmit: pt.func.isRequired,
    store: pt.object.isRequired
  }

  handleSubmit(e) {
    e.preventDefault();
    const content = findDOMNode(this.refs.content).innerHTML,
      lastUpdated = new Date();
    this.setState({
      content,
      lastUpdated
    });

    const blocks = this.props.store.blocks.map((block) => {
      return {
        tag: block.tag,
        content: this.props.store.dict[block.id],
        mediaRecord: block.mediaRecord
      };
    });

    const formValues = merge(this.state, {
      blocks,
      lastUpdated
    });
    this.props.handleSubmit(formValues);
  }

  handleChange(field, e) {
    this.setState({
      [field]: e.target.value
    });
  }

  onKeyDown(e) {
    debug('keydown');
    debug(this.refs.content);
    // e.preventDefault();
    if (e.keyCode === 13) {
      e.preventDefault();
      this.context.executeAction(addBlockAction, 'asdf');
      // this.makeNewBlock();
    }

  }

  onFocusCallback(index) {
    debug('Parent callback', index);
    this.setState({
      currentFocusedBlockIndex: index
    });
  }

  onChangeCallback(index) {
    debug('parent change callback', index);
  }

  insertPicture(mediaRecord) {
    this.context.executeAction(addBlockAction, {
      tag: 'Picture',
      mediaRecord
    });
  }

  log(e) {
    e.preventDefault();
    debug('state', this.state);
    debug(this.state.blocks);
    debug('Store:', this.props.store);
    const report = this.props.store.blocks.map((block) => {
      return {
        tag: block.tag,
        content: this.props.store.dict[block.id],
        mediaRecord: block.mediaRecord
      };
    });
    debug('REPORT:', report);
  }

  exec(command, e) {
    e.preventDefault();
    window.document.execCommand(command);
  }

  changeBlock(type, e) {
    e.preventDefault();
    this.context.executeAction(changeBlockAction, type);
  }

  deleteBlock(index, e) {
    e.preventDefault();
    this.context.executeAction(deleteBlockAction, index);
  }

  render() {

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="title">title</label>
          <input
            type="text"
            id="title"
            name="title"
            key="title"
            onChange={this.handleChange.bind(null, 'title')}
            value={this.state.title}
            />
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            id="slug"
            name="slug"
            key="slug"
            onChange={this.handleChange.bind(null, 'slug')}
            value={this.state.slug}
            />
          <label htmlFor="content">content</label>
          <div
            id="content"
            name="content"
            key="content"
            ref="content"

            onFocus={this.onEdit}
            onKeyDown={this.onKeyDown}>
            {this.props.store.blocks.map((block, index) =>
              <Block
                index={index}
                tag={block.tag}
                content={this.props.store.dict[block.id]}
                mediaRecord={block.mediaRecord}
                delete={this.deleteBlock}
                onClick={this.deleteBlock.bind(null, index)}
                onFocusCallback={this.onFocusCallback}
                onChangeCallback={this.onChangeCallback}
                focused={block.focused}
                blockId={block.id}
              />
            )}
          </div>

          <div>
            <Uploader callback={this.insertPicture} />
            <button
              className="button-primary"
              type="submit">
              {this.state.buttonText || 'Update Page'}
            </button>
            <button
              className="button-primary"
              onClick={this.log}>
              LOG
            </button>

            <button
              className="button-primary"
              onClick={this.exec.bind(this, 'italic')}>
              Italic
            </button>
            <button
              className="button-primary"
              onClick={this.exec.bind(this, 'bold')}>
              Bold
            </button>
            <button
              className="button-primary"
              onClick={this.changeBlock.bind(null, 'h1')}>
              h1
            </button>
            <button
              className="button-primary"
              onClick={this.changeBlock.bind(null, 'h2')}>
              h2
            </button>
            <button
              className="button-primary"
              onClick={this.changeBlock.bind(null, 'p')}>
              p
            </button>
            <button
              className="button-primary"
              onClick={this.changeBlock.bind(null, 'blockquote')}>
              blockquote
            </button>
          </div>

        </form>
      </div>

    );
  }
}

PageForm = connectToStores(PageForm, ['EditorStore'], (stores) => {
  return {
    store: stores.EditorStore.getState()
  };
});

export default PageForm;
