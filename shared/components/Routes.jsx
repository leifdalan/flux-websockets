import React from 'react';
import {Route, DefaultRoute, NotFoundRoute, Redirect} from 'react-router';
import Application from './Application';
import Dashboard from './Dashboard';
import SignIn from './SignIn';
import AdminIndex from './Admin';
import Users from './Admin/Users';
import User from './Admin/Users/User';
import CreateUser from './Admin/Users/CreateUser';
import ChatLobby from './ChatLobby';
import ChatRoom from './ChatRoom';
import NotFound from './NotFound';

export default (
  <Route name="app" path="/" handler={Application}>
    <Route name="home" path="/" handler={ChatLobby}/>
    <Route name="dashboard" handler={Dashboard}/>
    <Route name="signin" handler={SignIn}/>
    <Route name="chat">
      <DefaultRoute name="chatIndex" handler={ChatLobby}/>
      <Route path=":id" name="chatroom" handler={ChatRoom} />
    </Route>

    <Route name="admin">
      <DefaultRoute name="adminDashboard" handler={AdminIndex}/>
      <Route name="users">
        <Route path="create" name="createUser" handler={CreateUser} />
        <Route path=":id" name="adminUserEdit" handler={User} />

        <Route path="page/:perpage/:pagenumber"
          name="adminUsersPaginated"
          handler={Users}
          ignoreScrollBehavior
        />
        {/* Redirect users and users/page to paginated */}
        <Redirect
          from="/admin/users/?"
          to="adminUsersPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
        <Redirect
          from="/admin/users/page/?"
          to="adminUsersPaginated"
          params={{perpage: 20, pagenumber: 1}}
        />
      </Route>
    </Route>


    <NotFoundRoute handler={NotFound}/>
  </Route>
);
