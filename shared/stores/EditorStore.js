'use strict';
import {BaseStore} from 'fluxible/addons';
import uuid from 'uuid';
import {find} from 'lodash';
const debug = require('debug')('Store:Editor');

export default class EditorStore extends BaseStore {
  constructor(dispatcher) {
    super(dispatcher);
    const initialId = uuid.v4();
    this.blocks = [
      {
        id: initialId,
        tag: 'p',
        focused: true
      }
    ];
    this.dict = {
      [initialId]: ''
    };
    this.focusPos = 0;
    this._currentTag = 'p';
  }

  static storeName = 'EditorStore'

  static handlers = {
    'ADD_BLOCK': 'addBlock',
    'SET_FOCUS': 'setFocus',
    'SET_CONTENT': 'setContent',
    'CHANGE_BLOCK': 'changeBlock',
    'DELETE_BLOCK': 'deleteBlock'
  }

  addBlock(payload) {
    debug(payload);
    const newId = uuid.v4();
    this.blocks.map((block) => {
      block.focused = false;
      return block;
    });
    const newBlock = {
      id: uuid.v4(),
      tag: payload.tag || this._currentTag,
      focused: true
    };
    if (payload.tag === 'Picture') {
      newBlock.mediaRecord = payload.mediaRecord;
    }
    this.blocks.splice(this.focusPos + 1, 0, newBlock);
    this.dict[newId] = '';
    this.emitChange();
  }

  deleteBlock(payload) {
    this.blocks.splice(payload, 1);
    this.emitChange();
  }

  changeBlock(payload) {
    this.blocks[this.focusPos].tag = payload;
    this._currentTag = payload;
    this.emitChange();
  }

  setFocus(payload) {
    debug(payload);
    find(this.blocks, (block) => block.id === payload.blockId);
    this.blocks.forEach((block) => {
      if (block.id === payload.blockId) {
        block.focused = true;
      } else {
        block.focused = false;
      }
    });
    this._currentTag = this.blocks[payload.index].tag;
    this.focusPos = payload.index;
    this.emitChange();
  }

  setContent(payload) {
    this.dict[payload.blockId] = payload.content;
  }

  getState() {
    return {
      focusPos: this.focusPos,
      blocks: this.blocks,
      dict: this.dict
    };
  }

  dehydrate() {
    return this.getState();
  }

  rehydrate(state) {
    this.dict = state.dict;
    this.focusPos = state.focusPos;
    this.blocks = state.blocks;
  }
}
