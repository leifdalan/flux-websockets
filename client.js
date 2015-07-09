'use strict';

import React from 'react';
import debug from 'debug';
import app from './shared/app';
import Router, {HistoryLocation} from 'react-router';
import navigateAction from './shared/actions/navigate';
import config from './config';
import FluxibleComponent from 'fluxible/addons/FluxibleComponent';
import picturefill from 'picturefill';
const bootstrapDebug = debug('Bootstrapping App:');
const dehydratedState = window.App;

// Set client dev tool debug level
window.localStorage &&
  window.localStorage.setItem('debug', config.clientDebug);

window.picturefill = picturefill;

app.rehydrate(dehydratedState, (err, context) => {
  if (err) {
    throw err;
  }

  const renderApp = (runContext, Handler) => {
    bootstrapDebug('React Rendering');
    const mountNode = window.document.getElementById('app');

    // wrap the root element to provide children with access to the context
    const component = React.createFactory(Handler);
    React.render(React.createElement(
      FluxibleComponent,
      {context: runContext.getComponentContext()},
      component()
    ), mountNode);
  };

  const router = Router.create({
    routes: app.getComponent(),
    location: HistoryLocation,

    // Fluxible's branch allows for passing of Fluxible context
    // within React Router. Exposed in a component's willTransitionTo(arg)
    // method as arg.context.
    // Working off a branch of react-router:
    // https://github.com/bobpace/react-router/tree/transitionContext
    transitionContext: context
  });

  router.run((Handler, state) => {
    context.executeAction(navigateAction, state, () => {
      renderApp(context, Handler);
    });
  });
});
