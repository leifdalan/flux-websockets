# React Chat
An isomorphic chat application using Flux, socket.io, and React.

#### [Demo on Heroku](http://react-sockets.herokuapp.com)

This repo uses the following technologies:
- [React](https://facebook.github.io/react/)
- [react-router](https://github.com/rackt/react-router)
- [Fluxible](fluxible.io)
- [Express](https://www.npmjs.com/package/express)
- [Passport](https://www.npmjs.com/package/passport)
- [Babel](https://babeljs.io/)

Also for development, these tools are used:
- [webpack](http://webpack.github.io/)
- [webpack-dev-server ](http://webpack.github.io/docs/webpack-dev-server.html) (with HMR)
- [gulp](http://gulpjs.com/)
- [BrowserSync](http://www.browsersync.io/)
- Several other gulp packages for linting/optimizing/etc.

### Goals

I wanted to experiment with two things on this project: one being using websockets (socket.io) within the flux architecture, and the other being the usage of authenticated/authorized socket connections.

Baseline features I wanted to cover:

1. Isomorphic/shared codebase
2. Fully asynchronous authentication flow without full page loads
3. Session persistence handoff from server to client on first load
4. Public, authenticated, and authorized routes, and sockets
5. Robust & fun development workflow

#### Notes
* I have set the babel [experimental stage to 1](https://babeljs.io/docs/usage/experimental/) to support [Object Rest/Spread Properties](https://github.com/sebmarkbage/ecmascript-rest-spread) as this can be used very handily in React components. Since a transpiler is already running, I decided to practice and use as much ECMA2015 syntax as possible.

* I'm using a <span style="font-weight:bold;text-decoration:underline;">branch of react-router</span> to support fluxible's context inside of the ```willTransitionTo()``` hook. This is a known issue for the two technologies, as discussed in [this issue](https://github.com/rackt/react-router/pull/590). The branch can be found [here](https://github.com/bobpace/react-router/tree/transitionContext) coutesy of [bobpace](https://github.com/bobpace). I plan to regularly rebase against the react-router master branch if they don't decide accept bobpace's PR.


## Getting started
If you don't have [mongoDB installed](http://docs.mongodb.org/manual/installation/) already, this is required for authentication and data persistence. Setup will fail if you don't already have a mongo instance running.

If you want to just get started, simply type this in the command line:
```bash
npm start
```

If you want to go step by step, see the following sub processes that are all run by ```npm start```:
```bash
npm install
```

Start setup script:
```bash
npm run setup --no-spin
```
_Side note: I hate the npm task spinner, and in this case, it actually interferes with the prompt. You can turn it off globally with_ ```npm config set spin=false``` _for reference :)_

Follow the prompts to populate a config file and enter a few users into the mongoDB. There are many, many API keys that this repo uses that need to be populated for many of the features to work correctly:
1. Cloudinary (for file uploads)
2. AWS S3 bucket (also for file uploads)
3. Google/Facebook/Twitter login API credentials
4. Google XOAUTH2 API credentials + setup for forgotten password functionality (SMTP)

All of these can be found in config/secrets.js, which is generated after running npm run setup. You can also leave these blank, but those features listed will not work.

```bash
npm run client
```
Starts a development server with client-side rendering only, with hot-loading react modules enabled. Editing React components updates in the browser without refreshing the page, as well as editing any ```*.less``` files inside of the ```/src``` directory. ```nodemon``` will still restart if you save changes to server files, but not if you changed anything within ```/shared```. I've found this environment the most productive for rapid development.

```bash
npm run iso
```
Starts a development server that renders both server and client side, and restarts the server on any change. Good for checking to see if checksums are in order, but can be a little cumbersome to develop in.
```bash
npm run server
```
Starts a development server with client rendering turned off. The client asset application JavaScript file will not be included in the rendering of the document. Good test for "progressive enhancement" and is indicitive of what users will see with JavaScript disabled.
```bash
npm run prod
```
Starts a server in production mode. Optimized and gzipped assets with debugging disabled.

#### A note on debugging
This repo utilizes the NPM package [debug](https://www.npmjs.com/package/debug) for shared debugging messaging. Many packages within ```node_modules``` adhere to this standard, so having all messaging on can be a bit of a firehose of messaging. ```debug``` looks for the environment variable DEBUG for whitelist and blacklist values. ```npm run client``` and ```npm run server``` and ```npm run iso``` set ```DEBUG=[some sane defaults]``` upon execution. Client-side debugging configuration can be found in ```/config/index.js``` after setup.

#### Goodies
In development modes, gulp is running *two* development servers. The first one is on port 3002, which is webpack's dev server with hot module replacement enabled, which works swimmingly with React components. As of yet, Flux stores and and action dispatchers are not hot loadable, so the page will automatically refresh if you edit and save one of those modules. What is especially handy during HMR is component state is maintained between module replacements, so your app state stays intact while you live edit.

I decided to use BrowerSync for style live editing, as webpack was markedly slower. I may change this after some config tweaking but BrowserSync has a few more features that are nice, which are configurable on port 3001.

## TODO
- [x] Generalize file patterns, action constants, move to config
- [x] Create minimally styled version
- [x] Create deploy script
- [x] Add gulp tasks deploying assets to AWS with revisioning for production
- [x] Host demo on heroku or other free service

Thank you for browsing, contributions and issues are welcome.
