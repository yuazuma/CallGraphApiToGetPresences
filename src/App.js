import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Container } from 'reactstrap';
import { getUserDetails } from './GraphService';
import { UserAgentApplication } from 'msal';
import config from './Config';
import Create from './Create';
import ErrorMessage from './ErrorMessage';
import NavBar from './NavBar';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReadAll from './ReadAll';
import UserList from './UserList';
import Welcome from './Welcome';

const propTypes = {
  SetDbUsers: PropTypes.func,
  SetGraphUsers: PropTypes.func,
};

function ChangeButton(props) {
  return (
    <a href={props.link} onClick={() => props.onClick()}>
      {props.value}
    </a>
  );
}

class Body extends Component {
  constructor(props) {
    super(props);

    this.SetDbUsers = this.SetDbUsers.bind(this);
    this.SetGraphUsers = this.SetGraphUsers.bind(this);
    this.SetErrorMessage = this.SetErrorMessage.bind(this);

    this.state = {
      value: <div>main</div>,
    };
  }

  Create() {
    this.setState({
      value: (<Create
        DbUsers={this.state.dbusers}
        GraphUsers={this.state.graphusers}
        ReadAll={() => { this.ReadAll(); }}
        SetDbUsers={(dbusersval) => { this.SetDbUsers(dbusersval); }}
        SetGraphUsers={(graphusersval) => { this.SetGraphUsers(graphusersval); }}
        SetErrorMessage={({message, debug}) => { this.SetErrorMessage(message, debug);}}
      />)
    });
  }

  ReadAll() {
    this.setState({
      value: (<ReadAll
        DbUsers={this.state.dbusers}
        GraphUsers={this.state.graphusers}
        SetDbUsers={(dbusersval) => { this.SetDbUsers(dbusersval); }}
        SetGraphUsers={(graphusersval) => { this.SetGraphUsers(graphusersval); }}
        SetErrorMessage={({message, debug}) => { this.SetErrorMessage(message, debug);}}
      />)
    });
  }

  SetDbUsers(dbusersval) {
    return this.props.SetDbUsers(dbusersval);
  }

  SetGraphUsers(graphusersval) {
    return this.props.SetGraphUsers(graphusersval);
  }

  SetErrorMessage(graphusersval) {
    return this.props.SetErrorMessage(graphusersval);
  }

  render() {
    return (
      <Router>
        <div>
          <header>
            <ul>
              <li>
                <ChangeButton link="#Create" value="Create" onClick={() => this.Create()} />
              </li>
              <li>
                <ChangeButton link="#ReadAll" value="ReadAll" onClick={() => this.ReadAll()} />
              </li>
            </ul>
          </header>
          <p></p>
          <div>{this.state.value}</div>
        </div>
      </Router>
    );
  }
}
Body.propTypes = propTypes;

class App extends Component {
  constructor(props) {
    super(props);

    this.userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: config.appId
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
      }
    });

    var user = this.userAgentApplication.getAccount();

    this.state = {
      isAuthenticated: (user !== null),
      user: {},
      error: null,

      // children
      dbusers: [],
      graphusers: []
    };

    if (user) {
      // Enhance user object with data from Graph
      this.getUserProfile();
    }
  }

  SetDbUsers(dbusersval) {
    this.setState({ dbusers: dbusersval });
  }

  SetGraphUsers(graphusersval) {
    this.setState({ graphusers: graphusersval });
  }

  SetErrorMessage(message, debug) {
    this.setState({ error: { message: message, debug: debug } });
  }

  render() {
    let error = null;
    if (this.state.error) {
      error = <ErrorMessage message={this.state.error.message} debug={this.state.error.debug} />;
    }

    return (
      <Router>
        <div>
          <NavBar
            isAuthenticated={this.state.isAuthenticated}
            authButtonMethod={this.state.isAuthenticated ? this.logout.bind(this) : this.login.bind(this)}
            user={this.state.user} />
          <Container>
            {error}
            <Route exact path="/"
              render={(props) =>
                <Welcome {...props}
                  DbUsers={this.state.dbusers}
                  GraphUsers={this.state.graphusers}
                  isAuthenticated={this.state.isAuthenticated}
                  user={this.state.user}
                  authButtonMethod={this.login.bind(this)} />
              } />
            <Route exact path="/userlist"
              render={(props) =>
                <UserList {...props}
                  DbUsers={this.state.dbusers}
                  GraphUsers={this.state.graphusers}
                  SetGraphUsers={(graphusers) => { this.SetGraphUsers(graphusers); }}
                  SetErrorMessage={(message, debug) => {this.SetErrorMessage(message, debug)}} />
              } />
          </Container>
        </div>
      </Router>
    );
  }

  async login() {
    try {
      await this.userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });
      await this.getUserProfile();
    }
    catch (err) {
      var errParts = err.split('|');
      this.setState({
        isAuthenticated: false,
        user: {},
        error: { message: errParts[1], debug: errParts[0] }
      });
    }
  }

  logout() {
    this.userAgentApplication.logout();
  }

  async getUserProfile() {
    try {
      // Get the access token silently
      // If the cache contains a non-expired token, this function
      // will just return the cached token. Otherwise, it will
      // make a request to the Azure OAuth endpoint to get a token

      var accessToken = await this.userAgentApplication.acquireTokenSilent({
        scopes: config.scopes
      });

      if (accessToken) {
        // Get the user's profile from Graph
        var user = await getUserDetails(accessToken);
        this.setState({
          isAuthenticated: true,
          user: {
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName
          },
          error: null
        });
      }
    }
    catch (err) {
      var error = {};
      if (typeof (err) === 'string') {
        var errParts = err.split('|');
        error = errParts.length > 1 ?
          { message: errParts[1], debug: errParts[0] } :
          { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }

      this.setState({
        isAuthenticated: false,
        user: {},
        error: error
      });
    }
  }
}

export default App;
