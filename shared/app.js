import Fluxible from 'fluxible';

const app = new Fluxible({
  component: require('./components/Routes.jsx')
});

app.registerStore(require('./stores/ApplicationStore'));
app.registerStore(require('./stores/UserStore'));
app.registerStore(require('./stores/ChatStore'));
app.registerStore(require('./stores/PageStore'));
app.registerStore(require('./stores/EditorStore'));

export default app;
