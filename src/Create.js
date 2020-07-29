import 'bootstrap/dist/css/bootstrap.css';
import { Button } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const GEOCODE_ENDPOINT = 'https://qesusermanagement.azurewebsites.net/api/v1/User';
const X_FUNCTIONS_KEY = '?code=feDLiwSv7g2s/FVDBjaQyf1PdksH6/oMATagGPdTKZT93gCa3APNzA==';

const propTypes = {
  ReadAll: PropTypes.func,
};

class Create extends Component {
  constructor(props) {
    super(props);

    this.changeStoreUserFormIdText = this.changeStoreUserFormIdText.bind(this);
    this.changeStoreUserFormAadidText = this.changeStoreUserFormAadidText.bind(this);
    this.changeStoreUserFormRoleText = this.changeStoreUserFormRoleText.bind(this);
    this.changeStoreUserFormOrganizationidText = this.changeStoreUserFormOrganizationidText.bind(this);

    this.ReadAll = this.ReadAll.bind(this);

    this.state = { users: [] };
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

  ReadAll() {
    this.props.ReadAll();
  }

  StoreUser() {
    var jsondata = JSON.stringify({
      id: this.state.id,
      aadid: this.state.aadid,
      role: this.state.role,
      organizationid: this.state.organizationid
    });

    // Create
    axios
      .post(GEOCODE_ENDPOINT + X_FUNCTIONS_KEY, jsondata)
      .then((results) => {
        const status = results.status;
        if (status.toString() === "201") {
          this.ReadAll();
        }
      },
      )
      .catch(() => {
        console.log('通信に失敗しました。');
      });
  }

  render() {
    return (
      <div className="app">
        <div id="StoreUserForm">
          <input type="text" placeholder="AAD ID" onChange={this.changeStoreUserFormAadidText} value={this.state.aadid ? this.state.aadid : ""} />
          <input type="text" placeholder="Role" onChange={this.changeStoreUserFormRoleText} value={this.state.role ? this.state.role : ""} />
          <input type="text" placeholder="Organization ID" onChange={this.changeStoreUserFormOrganizationidText} value={this.state.organizationid ? this.state.organizationid : ""} />
          <Button color="primary" onClick={() => this.StoreUser()}>Store</Button>
        </div>
      </div>
    );
  }
}

Create.propTypes = propTypes;
export default Create;
