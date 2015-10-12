'use strict';

import React, {Component, PropTypes as pt} from 'react';
const debug = require('debug')('Component:EmailTemplate');
debug();

class EmailTemplate extends Component {

  constructor(props) {
    super(props);
    // autoBindAll.call(this, [
    //   ''
    // ]);
  }

  static displayName = 'EmailTemplate'

  static contextTypes = {
    router: pt.func.isRequired,
    getStore: pt.func.isRequired,
    executeAction: pt.func.isRequired
  }

  static propTypes = {
    store: pt.object.isRequired
  }

  render() {
    /*eslint-disable*/
    const css = '#outlook a,body{padding:0}a img,img{border:none}table,table td{border-collapse:collapse}a,img{text-decoration:none}body{width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0}.ExternalClass{width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}#backgroundTable{margin:0;padding:0;width:100%!important;line-height:100%!important}img{outline:0;-ms-interpolation-mode:bicubic}.image_fix{display:block}p{margin:0!important}table{mso-table-lspace:0;mso-table-rspace:0}a{color:#0a8cce;text-decoration:none!important}table[class=full]{width:100%;clear:both}@media only screen and (max-width:640px){a[href^=tel],a[href^=sms]{text-decoration:none;color:#0a8cce;pointer-events:none;cursor:default}.mobile_link a[href^=tel],.mobile_link a[href^=sms]{text-decoration:default;color:#0a8cce!important;pointer-events:auto;cursor:default}table[class=devicewidth]{width:440px!important;text-align:center!important}table[class=devicewidthinner]{width:420px!important;text-align:center!important}img[class=banner],img[class=colimg2]{width:440px!important;height:220px!important}}@media only screen and (max-width:480px){a[href^=tel],a[href^=sms]{text-decoration:none;color:#0a8cce;pointer-events:none;cursor:default}.mobile_link a[href^=tel],.mobile_link a[href^=sms]{text-decoration:default;color:#0a8cce!important;pointer-events:auto;cursor:default}table[class=devicewidth]{width:280px!important;text-align:center!important}table[class=devicewidthinner]{width:260px!important;text-align:center!important}img[class=banner],img[class=colimg2]{width:280px!important;height:140px!important}td[class=mobile-hide]{display:none!important}td[class=padding-bottom25]{padding-bottom:25px!important}}'

    return (
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Simples-Minimalistic Responsive Template</title>
          <style type="text/css">
            {css}
          </style>
        </head>
        {/* Start of header */}
        <body>
          <h1>Chat password</h1>
          <a style={{
            display: 'inline-block',
            background: 'green',
            color: 'white',
            textAlign: 'center',
            margin: '0 auto',
            borderRadius: '5px',
            padding: '30px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }} href={this.props.callToAction}>
            Reset your password
          </a>

          {/* End of postfooter */}
        </body>
      </html>
    );
  }
}
/*eslint-enable*/
export default EmailTemplate;
