'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {autoBindAll} from '../../../../utils';
import PageForm from './PageForm';
import {CheckAdminWillTransitionTo} from '../../../mixins/authMixins';
import {editPageAction} from '../../../actions/pageActions';

const debug = require('debug')('Component:CreatePage');
debug();

export default class CreatePage extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'handleSubmit'
    ]);
  }

  static displayName = 'CreatePage'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static willTransitionTo = CheckAdminWillTransitionTo

  handleSubmit(formValues) {
    const router = this.context.router;
    this.context.executeAction(editPageAction, {
      formValues,
      router
    });
  }

  render() {
    return (
      <PageForm handleSubmit={this.handleSubmit} buttonText="Create" />
    );
  }
}
