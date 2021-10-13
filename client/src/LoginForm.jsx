import { Component } from "react";
//import App from './App'
import Chatpage from './Chatpage'
import "./App.css";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatUrl:"http://localhost:3001",
      username: "",
      password: "",
      isVisible: true
    }
    
  }

  updateInput = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  clear = () => {
    this.setState({username: "", chatUrl: "", password: ""})
  }

  handleLogin(data) {
    //stream = new EventSource(this.state.chatUrl + "/stream/" + sessionStorage.accessToken    );
    //Chatpage.setState({message_token: data.message_token, stream_token: data.stream_token});
    this.setState({isVisible: false})
    this.props.handleLogin(data.message_token, data.stream_token)

  }

  /*getBoxClassName() {
    this.setState({isVisible ? "login" : "hidden"}
  }*/


  login = (event) => {
    //alert(JSON.stringify(this.state))
    event.preventDefault();
    const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'

        },
        body: JSON.stringify({ username: this.state.username, password: this.state.password })
    };

    fetch(this.state.chatUrl + '/login', requestOptions)
            .then(response => response.json())
            .then(data => this.handleLogin(data));
    
  }


  render() {
    return (
      <form class={this.state.isVisible ? "login" : "hide"} id="login">
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
