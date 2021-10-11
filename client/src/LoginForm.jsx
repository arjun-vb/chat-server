import { Component } from "react";
import "./App.css";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatUrl:"http://localhost:3001",
      username: "",
      password: ""
    }
    
  }

  updateInput = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  clear = () => {
    this.setState({username: "", chatUrl: "", password: ""})
  }

  startStream(data) {
    //stream = new EventSource(this.state.chatUrl + "/stream/" + sessionStorage.accessToken    );
    console.log(data)
  }

  login = (event) => {
    //alert(JSON.stringify(this.state))
    const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'

        },
        body: JSON.stringify({ username: this.state.username, password: this.state.password })
    };
    
    fetch(this.state.chatUrl + '/login', requestOptions)
      .then((response) => {       
        this.startStream(response.data)     
      })/*.then((data) => {
        this.startStream(data)
      });*/
    event.preventDefault();
  }


  render() {
    return (
      <form class="login">
        <div class="head">
          <h2>Login</h2>
        </div><br/>
        <div class="inputtext">          
          <label for="chatUrl">Chat URL: </label><br/>
          <input type="text" class="text" onChange={this.updateInput} value={this.state.chatUrl} name="chatUrl"/>  <br/>
        </div><br/>

        <div class="inputtext">
          <label for="username">Username: </label><br/>
          <input type="text" class="text" onChange={this.updateInput} value={this.state.username} name="username"/> <br/>
        </div><br/>

        <div class="inputtext">
          <label for="password">Password: </label><br/>
          <input type="password" class="text" onChange={this.updateInput} value={this.state.password} name="password"/> <br/>
        </div><br/>

        <div class="inputtext">
          <input type="submit" class="button" onClick={this.login} value="Login"/>
          <input type="submit" class="button" onClick={this.clear} value="Clear"/> <br/>
        </div>
      </form>
    );
  }
}

export default LoginForm;
