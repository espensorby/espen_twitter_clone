import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import './App.css';

import Login from './components/Login';
import Feed from './components/Feed';
import Authenticate from './components/Authenticate';
import Logout from './components/Logout';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <HashRouter>
      <Switch> {/*Med switch rendres kun førse komponent som matcher på path, typ '/home' rendrer ikke også '/' */}
        <Route path='/' exact component={Authenticate} />
        <Route path='/home' component={Feed} />
        <Route path='/login' component={Login} />
        <Route path='/logout' component={Logout} />
        <Route path='/signup' component={Signup} />
        <Route path='/:handle' component={UserProfile} />
      </Switch>
    </HashRouter>
  );
}

export default App;
