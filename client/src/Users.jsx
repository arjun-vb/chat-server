import { Component } from "react";
import "./App.css";

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }    
  }

  addUser(username) {    
    var newdiv = document.createElement('div');
    newdiv.innerHTML = username;
    newdiv.setAttribute("id", username);
    document.getElementById('userlist').appendChild(newdiv);
  }
  
  removeUser(username) {
    var user = document.getElementById(username);
    user.remove();
  }

  render() {
    return (
      <div>
      	<div class='onlineuser'>Online Users</div>
        <div id='userlist'>
        </div>
      </div>
    );
  }
}

export default Users;
