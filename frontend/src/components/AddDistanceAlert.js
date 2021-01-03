import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert'

class AddDistanceAlert extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            variant: undefined,
            heading: undefined,
            message: undefined
        };
    }

    success = () => {
        this.setState({
            visible: true,
            variant: "success",
            heading: "Success",
            message: "Added a new distance"
        });
    }

    failure = () => {
        this.setState({
            visible: true,
            variant: "danger",
            heading: "Error",
            message: "Something went wrong"
        });
    }

    render() {
        if (this.state.visible) {
            return (
                <>
                    <div>
                        <Alert variant={this.state.variant} onClose={() => this.setState({ visible: false })} dismissible>
                            <Alert.Heading>{this.state.heading}</Alert.Heading>
                            <p>
                                {this.state.message}
                            </p>
                        </Alert>
                    </div>
                </>
            );
        }
        return null;
    }
}

export default AddDistanceAlert;