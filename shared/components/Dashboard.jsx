'use strict';

import React, {Component, PropTypes as pt} from 'react';
import {CheckLoginWillTransitionTo} from '../mixins/authMixins';
import DocumentTitle from 'react-document-title';
import {connectToStores} from 'fluxible/addons';
import {autoBindAll} from '../../utils';
import Uploader from './Editor/Uploader';
import {uploadFileAction} from '../actions/appActions';
const debug = require('debug')('Component:Dashboard');
debug();

class Dashboard extends Component {

  constructor(props) {
    super(props);
    autoBindAll.call(this, [
      'uploadCallback'
    ]);

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

  uploadCallback(payload) {
    debug(payload);
    debug('GENERIC RESPONSE');
  }

  render() {
    return (
      <DocumentTitle title="Dashboard">
        <div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quid minus probandum quam esse aliquem beatum nec satis beatum? Sed haec omittamus; Parvi enim primo ortu sic iacent, tamquam omnino sine animo sint. Quamquam tu hanc copiosiorem etiam soles dicere. Ut placet, inquit, etsi enim illud erat aptius, aequum cuique concedere. Habes, inquam, Cato, formam eorum, de quibus loquor, philosophorum. Duo Reges: constructio interrete.</p>
          <Uploader callback={this.uploadCallback} />
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
