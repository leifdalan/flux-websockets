'use strict';
import React, {Component, PropTypes as rpt} from 'react';
import Modal, {Body, Header, Title, Footer, Dismiss} from 'react-bootstrap-modal';

export default class ModalWrapper extends Component {

  static defaultProps = {
    ariaLabel: 'ModalHeader'
  }

  static propTypes = {
    show: rpt.bool.isRequired,
    onHide: rpt.func.isRequired
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        aria-labelledby={this.props.ariaLabel}>

        <Header closeButton>
          {this.props.title &&
            <Title id={this.props.ariaLabel}>
              {this.props.title}
            </Title>
          }
        </Header>
        <Body>
          {this.props.children}
        </Body>
        <Footer>
          <Dismiss>Cancel</Dismiss>
        </Footer>
      </Modal>
    );
  }
}
