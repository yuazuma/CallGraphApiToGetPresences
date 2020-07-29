import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'reactstrap';
import { getUsers } from './GraphService';
import { Table } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import config from './Config';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const GEOCODE_ENDPOINT = 'https://qesusermanagement.azurewebsites.net/api/v1/User';
const X_FUNCTIONS_KEY = '?code=feDLiwSv7g2s/FVDBjaQyf1PdksH6/oMATagGPdTKZT93gCa3APNzA==';

const propTypes = {
  SetDbUsers: PropTypes.func,
  SetGraphUsers: PropTypes.func
};

class ReadAll extends Component {
  constructor(props) {
    super(props);

    this.changeStoreUserFormIdText = this.changeStoreUserFormIdText.bind(this);
    this.changeStoreUserFormAadidText = this.changeStoreUserFormAadidText.bind(this);
    this.changeStoreUserFormRoleText = this.changeStoreUserFormRoleText.bind(this);
    this.changeStoreUserFormOrganizationidText = this.changeStoreUserFormOrganizationidText.bind(this);
    this.SetDbUsers = this.SetDbUsers.bind(this);
    this.SetGraphUsers = this.SetGraphUsers.bind(this);

    this.Notify = this.Notify.bind(this);

    this.state = {
      dbusers: [],
      graphusers: []
    };

    this.ReadDbUsers();
  }

  changeStoreUserFormIdText(e) {
    this.setState({ id: e.target.value })
  }

  changeStoreUserFormAadidText(e) {
    this.setState({ aadid: e.target.value })
  }

  changeStoreUserFormRoleText(e) {
    this.setState({ role: e.target.value })
  }

  changeStoreUserFormOrganizationidText(e) {
    this.setState({ organizationid: e.target.value })
  }

  SetDbUsers(dbusersval) {
    this.setState({ dbusers: dbusersval })
    return this.props.SetDbUsers(dbusersval);
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

  async JoinGraphUsers() {
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
      console.log('gotusers.value');
      console.log(gotusers.value);


      // join
      var DbUsers = this.state.dbusers;
      var GraphUsers = this.state.graphusers;
      console.log('DbUsers');
      console.log(DbUsers);
      console.log('GraphUsers');
      console.log(GraphUsers);

      if ((typeof DbUsers !== 'undefined') && (typeof GraphUsers !== 'undefined')) {
        if ((DbUsers.length > 0) && (GraphUsers.length > 0)) {
          console.log('DbUsers');
          console.log(DbUsers);
          console.log('GraphUsers');
          console.log(GraphUsers);
          var Joined = DbUsers.map(dbusr =>
            GraphUsers.some(gusr => gusr.id === dbusr.aadid) ?
              GraphUsers.filter(gusr => gusr.id === dbusr.aadid).map(gusr => Object.assign(gusr, dbusr)) :
              { dbusr }
          ).reduce((a, b) => a.concat(b), []);
          console.log('Joined');
          console.log(Joined);

          this.SetDbUsers(Joined);

          console.log('this.state.dbusers');
          console.log(this.state.dbusers);
        }
      }


      //
    }
    catch (err) {
      console.log(String(err));
      this.props.SetErrorMessage('ERROR', JSON.stringify(err));
    }
  }

  CreateUser() {
    this.setState({
      id: "",
      aadid: "",
      role: "",
      organizationid: "",
      aadidEnabled: true
    });

    this.refs['StoreUserFormAadidText'].focus();
  }

  ReadDbUsers() {
    axios
      .get(GEOCODE_ENDPOINT + X_FUNCTIONS_KEY)
      .then((results) => {
        const status = results.status;
        if (status.toString() === "200") {
          const data = results.data;
          this.setState({ dbusers: data });
          this.SetDbUsers(data);
          this.Notify("success", "[Cosmos DB]読込みが完了しました。");

          this.JoinGraphUsers();
        }
      },
      )
      .catch((e) => {
        this.Notify("error", "[Cosmos DB]通信に失敗しました。" + e);
      });
  }

  UpdateUser(user) {
    this.setState({
      id: user.id,
      aadid: user.aadid,
      role: user.role,
      organizationid: user.organizationid,
      aadidEnabled: false
    });
  }

  StoreUser() {
    var jsondata = JSON.stringify({
      id: this.state.id,
      aadid: this.state.aadid,
      role: this.state.role,
      organizationid: this.state.organizationid
    });

    if (this.state.dbusers.some(user => user.id === this.state.id)) {
      // Update
      axios
        .put(GEOCODE_ENDPOINT + "/" + this.state.aadid + X_FUNCTIONS_KEY, jsondata)
        .then((results) => {
          const status = results.status;
          if (status.toString() === "204") {
            this.Notify("success", "[Cosmos DB]保存が完了しました。");
            this.ReadDbUsers();
          }
        },
        )
        .catch(() => {
          this.Notify("error", "[Cosmos DB]通信に失敗しました。");
        });
    } else {
      // Create
      axios
        .post(GEOCODE_ENDPOINT + X_FUNCTIONS_KEY, jsondata)
        .then((results) => {
          const status = results.status;
          if (status.toString() === "201") {
            this.Notify("success", "[Cosmos DB]追加が完了しました。");
            this.ReadDbUsers();
          }
        },
        )
        .catch(() => {
          console.log('[Cosmos DB]通信に失敗しました。');
        });
    }
  }

  DeleteUser(aadid) {
    axios
      .delete(GEOCODE_ENDPOINT + "/" + aadid + X_FUNCTIONS_KEY)
      .then((results) => {
        const status = results.status;
        if (status.toString() === "204") {
          this.Notify("success", "[Cosmos DB]削除が完了しました。");
          this.ReadDbUsers();
        }
      },
      )
      .catch(() => {
        console.log('[Cosmos DB]通信に失敗しました。');
      });
  }

  render() {

    // table area
    return (
      <div className="app">
        <div className="buttons">
          <Button color="outline-primary" onClick={() => this.CreateUser()}>Create</Button>
        </div>
        <hr />
        <Table>
          <thead>
            <tr>
              <th scope="col">AAD ID</th>
              <th scope="col">DisplayName</th>
              <th scope="col">Role</th>
              <th scope="col">Organization ID</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.dbusers.map(user => {
                return (
                  <tr key={user.id}>
                    <td title={user.id} >{user.id}</td>
                    <td title={user.displayName}>{user.displayName}</td>
                    <td title={user.role}>{user.role}</td>
                    <td title={user.organizationid}>{user.organizationid}</td>
                    <td><Button color="outline-warning" onClick={() => this.UpdateUser(user)}>Update</Button></td>
                    <td><Button color="outline-danger" onClick={() => this.DeleteUser(user.aadid)}>Delete</Button></td>
                  </tr>
                );
              })
            }
          </tbody>
        </Table>
        <hr />
        <div id="StoreUserForm">
          <input type="text" placeholder="AAD ID" onChange={this.changeStoreUserFormAadidText} value={this.state.aadid ? this.state.aadid : ""} readOnly={!this.state.aadidEnabled} ref="StoreUserFormAadidText" />
          <input type="text" placeholder="Role" onChange={this.changeStoreUserFormRoleText} value={this.state.role ? this.state.role : ""} />
          <input type="text" placeholder="Organization ID" onChange={this.changeStoreUserFormOrganizationidText} value={this.state.organizationid ? this.state.organizationid : ""} />
          <Button color="primary" onClick={() => this.StoreUser()}>Store</Button>
        </div>
        <ToastContainer hideProgressBar />
      </div>
    );
  }
}

ReadAll.propTypes = propTypes;
export default ReadAll;
