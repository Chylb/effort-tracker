import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import Header from './components/parts/Header';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Footer from './components/parts/Footer';
import { Activities } from './pages/activities/Activities';
import { ActivityPage } from './pages/activity/Activity';
import { DistancePage } from './pages/distance/Distance';
import { DistancesPage } from './pages/distances/Distances';
import { Home } from './pages/home/Home';
import { Login } from './pages/login/Login';
import { Error } from './pages/error/Error';
import { SuccessfulLogin } from './pages/successfulLogin/SuccessfulLogin';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  document.title = "Effort tracker";

  return (
    <BrowserRouter>
      {localStorage.getItem("username") && <Header />}
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/successfulLogin" component={SuccessfulLogin} />
        <ProtectedRoute exact path="/" component={Home} />
        <ProtectedRoute exact path="/home" component={Home} />
        <ProtectedRoute exact path="/activities" component={Activities} />
        <ProtectedRoute exact path="/activities/:id" component={ActivityPage} />
        <ProtectedRoute exact path="/distances" component={DistancesPage} />
        <ProtectedRoute exact path="/distances/:id" component={DistancePage} />
        <ProtectedRoute path="/error" component={Error} />
        <Redirect from='*' to='/error' />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
