import { Component } from "react";
import "./App.css";

class Users extends Component {

  constructor(props) {
    super(props); 
    this.state = {
      userList : []
    }
  }
  
  addUser(username) {
    const index = this.state.userList.findIndex(user => user === username);
    if(index === -1) {
      this.setState({
        userList: this.state.userList.concat(username)
      })
    }
  }
  
  removeUser(username) {
    var index = this.state.userList.indexOf(username);
    if (index === -1) return;

    var newstate = this.state.userList.slice(0, index).concat(this.state.userList.slice(index+1))

    this.setState({
      userList: newstate
    })
  }

  clearAllUsers() {
    this.setState({
      userList: []
    })
  }

  render() {
    return (
      <div>
      	<div class='onlineuser'>Online Users</div>
        <div id='userlist'>
        {this.state.userList.map(user => (
          <div key={user}>{user}</div>
        ))}
        </div>
      </div>
    );
  }
}

export default Users;