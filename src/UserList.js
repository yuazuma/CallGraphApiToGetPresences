import 'react-toastify/dist/ReactToastify.css';
import { getUsers } from './GraphService';
import { Table } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import config from './Config';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const propTypes = {
  SetGraphUsers: PropTypes.func,
};

class UserList extends Component {
  constructor(props) {
    super(props);

    this.SetGraphUsers = this.SetGraphUsers.bind(this);

    this.Notify = this.Notify.bind(this);

    this.state = {
      graphusers: []
    };
  }

  SetGraphUsers(graphusersval) {
    return this.props.SetGraphUsers(graphusersval);
  }

  Notify(type, message) {
    switch (type) {
      case "info":
        toast.info(message, { toastId: 1 });
        break;
      case "success":
        toast.success(message, { toastId: 2 });
        break;
      case "warning":
        toast.warn(message, { toastId: 3 });
        break;
      case "error":
        toast.error(message, { toastId: 4 });
        break;
      default:
        toast(message, { toastId: 5 });
        break;
    }
  }

  async componentDidMount() {
    try {
      // Get the user's accessr token
      var accessToken = await window.msal.acquireTokenSilent({
        scopes: config.scopes
      });
      // Get users
      var gotusers = await getUsers(accessToken);
      // Update the array of users in state
      this.setState({ graphusers: gotusers.value });

      this.SetGraphUsers(gotusers.value);
      
      this.Notify("info", "[Graph API]読込みが完了しました。");
    }
    catch (err) {
      console.log(String(err));
      this.props.SetErrorMessage('ERROR', JSON.stringify(err));
    }
  }

  render() {
    return (
      <div>
        <h1>UserList</h1>
        <Table>
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">displayName</th>
              <th scope="col">userPrincipalName<br />mail</th>
              <th scope="col">businessPhones<br />mobilePhone</th>
              <th scope="col">preferredLanguage</th>
              <th scope="col">availability</th>
              <th scope="col">activity</th>
            </tr>
          </thead>
          <tbody>
            {this.state.graphusers.map(
              function (graphuser) {
                return (
                  <tr key={graphuser.id}>
                    <td>{graphuser.id}</td>
                    <td title={graphuser.surname + ' ' + graphuser.givenName}>{graphuser.displayName}</td>
                    <td>
                      <a href={'mailto:' + graphuser.userPrincipalName}>{graphuser.userPrincipalName}</a>
                      <br />
                      {graphuser.mail ? <a href={'mailto:' + graphuser.mail}>{graphuser.mail}</a> : ' - '}
                    </td>
                    <td>
                      {(graphuser.businessPhones).length !== 0 ? graphuser.businessPhones : ' - '}
                      <br />
                      {graphuser.mobilePhone ? graphuser.mobilePhone : ' - '}
                    </td>
                    <td>
                      {graphuser.preferredLanguage ? graphuser.preferredLanguage : ' - '}
                    </td>
                    <td>
                      <>
                          {'Available' === graphuser.availability && (
                              <span style={{color: 'green'}}>●</span>
                          )}
                          {'Offline' === graphuser.availability && (
                              <span style={{color: 'red'}}>●</span>
                          )}
                          (
                            <span>{graphuser.availability ? graphuser.availability : ' - '}</span>
                          )
                      </>
                    </td>
                    <td>
                      {graphuser.activity ? graphuser.activity : ' - '}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
        <ToastContainer hideProgressBar />
      </div>
    );
  }
}

UserList.propTypes = propTypes;
export default UserList;
