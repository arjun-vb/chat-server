import { Component } from "react";
import "./App.css";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatUrl:"",
      //chatUrl: "",
      username: "",
      password: "",
      isVisible: true
    }
    this.handleLogin = this.handleLogin.bind(this)
    
  }

  updateInput = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  clear = () => {
    this.setState({username: "", chatUrl: "", password: ""})
  }

  handleLogin(data) {
    this.setState({isVisible: false})
    this.props.handleLogin(data.message_token, data.stream_token, this.state.chatUrl)

  }

  showLogin() {
    this.setState({isVisible: true})
    this.clear();
  }


  login = (event) => {

    var request = new XMLHttpRequest();
    var form = new FormData();
    form.append("password", this.state.password);
    form.append("username", this.state.username);

    request.open("POST", this.state.chatUrl + '/login');

    request.addEventListener("readystatechange", () => {
      if (request.readyState !== 4) return;
      if (request.status === 201) {
          const data = JSON.parse(request.responseText);

          this.handleLogin(data);
      } else if (request.status === 403) {
          alert("Invalid username or password");
      } else if (request.status === 409) {
          alert(this.state.username+ " is already logged in");

      } else {
          alert(request.status + " failure to /login");
      }

    });
    
    request.send(form);
    event.preventDefault();
    
  }


  render() {
    return (
      <form className={this.state.isVisible ? "login" : "hide"} id="login">
        <div class="head">
          <h2>Login</h2>
        </div><br/>
        <div class="inputtext">          
          <label for="chatUrl">Chat URL: </label><br/>
          <input type="text" class="text" onChange={this.updateInput} value={this.state.chatUrl} name="chatUrl" autoFocus/>  <br/>
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
