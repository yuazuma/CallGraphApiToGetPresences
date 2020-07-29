import 'bootstrap/dist/css/bootstrap.css';
import { Button, Jumbotron } from 'reactstrap';
import { Table } from 'reactstrap';
import React, { Component } from 'react';

function WelcomeContent(props) {
  // If authenticated, greet the user
  if (props.isAuthenticated) {
    var DbUsers = props.DbUsers;
    var GraphUsers = props.GraphUsers;
    if ((typeof DbUsers !== 'undefined') && (typeof GraphUsers !== 'undefined')) {
      if ((DbUsers.length > 0) && (GraphUsers.length > 0)) {
        var Joined = DbUsers.map(dbusr =>
          GraphUsers.some(gusr => gusr.id === dbusr.aadid) ?
            GraphUsers.filter(gusr => gusr.id === dbusr.aadid).map(gusr => Object.assign(gusr, dbusr)) :
            { dbusr }
        ).reduce((a, b) => a.concat(b), []);

        return (
          <div>
            <div>
              <h4>Welcome {props.user.displayName}!</h4>
              <p>Use the navigation bar at the top of the page to get started.</p>
            </div>
            <Table>
              <thead>
                <tr>
                  <th scope="col">displayName</th>
                  <th scope="col">aadid</th>
                  <th scope="col">id</th>
                  <th scope="col">organizationid</th>
                  <th scope="col">role</th>
                </tr>
              </thead>
              <tbody>
                {Joined.map(function (joinedUser, index) {
                  return (
                    <tr key={index}>
                      <td><a href={'mailto:' + joinedUser.userPrincipalName}>{joinedUser.displayName}</a></td>
                      <td>{joinedUser.aadid}</td>
                      <td>{joinedUser.id}</td>
                      <td>{joinedUser.organizationid}</td>
                      <td>{joinedUser.role}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      }
    }

    return (
      <div>
        <h4>Welcome {props.user.displayName}!</h4>
        <p>Use the navigation bar at the top of the page to get started.</p>
      </div>
    );
  }

  // Not authenticated, present a sign in button
  return <Button color="primary" onClick={props.authButtonMethod}>Click here to sign in</Button>;
}

export default class Welcome extends Component {

  render() {
    return (
      <Jumbotron>
        <h1>Presences</h1>
        <p className="lead">This sample app shows how to use the Microsoft Graph API to access Outlook and OneDrive data from React</p>
        <WelcomeContent
          DbUsers={this.props.DbUsers}
          GraphUsers={this.props.GraphUsers}
          isAuthenticated={this.props.isAuthenticated}
          user={this.props.user}
          authButtonMethod={this.props.authButtonMethod} />
      </Jumbotron>
    );
  }
}