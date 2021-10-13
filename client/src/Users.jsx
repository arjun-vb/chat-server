import { Component } from "react";
import "./App.css";

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    this.displayUsers = []
    
  }

  appendData(message) {
    this.displayUsers.push(<div>message</div>)
  }

  render() {
    return (
      <div>
      	Online Users
        <div>
          {this.displayUsers}
        </div>
      </div>
    );
  }
}

export default Users;
