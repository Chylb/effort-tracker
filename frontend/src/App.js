import React, { Component } from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute.js'

import Login from './components/pages/Login.js'
import Error from './components/pages/Error.js'
import SuccessfulLogin from './components/pages/SuccessfulLogin.js';
import Home from './components/pages/Home.js';
import Distances from './components/pages/Distances.js';
import Distance from './components/pages/Distance.js';
import Activities from './components/pages/Activities.js';
import Activity from './components/pages/Activity.js';

import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  componentDidMount() {
    document.title = "Effort tracker";
  }

  render() {
    return (
      <>
        <BrowserRouter>
          {localStorage.getItem("username") && <Header />}
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/successfulLogin" component={SuccessfulLogin} />
            <ProtectedRoute exact path="/" component={Home} />
            <ProtectedRoute path="/home" component={Home} />
            <ProtectedRoute exact path="/activities" component={Activities} />
            <ProtectedRoute exact path="/activities/:id" component={Activity} />
            <ProtectedRoute exact path="/distances" component={Distances} />
            <ProtectedRoute exact path="/distances/:id" component={Distance} />
            <ProtectedRoute path="/error" component={Error} />
            <Redirect from='*' to='/error' />
          </Switch>
          <Footer />
        </BrowserRouter>
      </>
    );
  }
}

export default App;