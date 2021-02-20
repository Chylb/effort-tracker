import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Activities } from './pages/activities/Activities';
import { ActivityPage } from './pages/activity/Activity';
import { DistancePage } from './pages/distance/Distance';
import { DistancesPage } from './pages/distances/Distances';
import { Home } from './pages/home/Home';
import { Login } from './pages/login/Login';
import { Error } from './pages/error/Error';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/parts/Header';
import { Footer } from './components/parts/Footer';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  document.title = "Effort tracker";

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Switch>
          <Route path="/login" component={Login} />
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
      </BrowserRouter >
    </AuthProvider>
  );
}

export default App;
