import React, { Component } from 'react';
import { Jumbotron, Container, Table } from "react-bootstrap";
import { fetchApi, secondsToString } from '../../Utils.js'

class Home extends Component {
  state = {
    summary: null
  };

  async componentDidMount() {
    const summary = await fetchApi('http://localhost:8080/api/athlete/summary')

    this.setState({ summary: summary });
  }

  render() {
    return (
      <>
        <Jumbotron fluid>
          <Container>
            <h1>Hello, {localStorage.getItem("username")}!</h1>
            <p>Here is a summary</p>
          </Container>
        </Jumbotron>

        {this.state.summary &&
          <Container>
            <Table id="table">
              <tbody>
                <tr>
                  <td><h2>Number of distances:</h2></td>
                  <td><h2>{this.state.summary.distances}</h2></td>
                </tr>
                <tr>
                  <td><h2>Number of activities:</h2></td>
                  <td><h2>{this.state.summary.activities}</h2></td>
                </tr>
                <tr>
                  <td><h2>Number of efforts:</h2></td>
                  <td><h2>{this.state.summary.efforts}</h2></td>
                </tr>
                <tr>
                  <td><h2>Best pace:</h2></td>
                  <td><h2>{secondsToString(this.state.summary.bestPace)}</h2></td>
                </tr>
              </tbody>
            </Table>
          </Container>
        }
      </>
    );
  }
}

export default Home;