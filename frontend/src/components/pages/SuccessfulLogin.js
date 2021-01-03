import React, { Component } from 'react';
import { fetchApi } from '../../Utils.js'

class SuccessfulLogin extends Component {

  async componentWillMount() {
    const data = await fetchApi('http://localhost:8080/api/athlete')

    localStorage.setItem("username", data.name);
    localStorage.setItem("avatar", data.profilePicture);
    window.location.href = "/home";
  }

  render() {
    return (
      <>
      </>
    );
  }
}

export default SuccessfulLogin;