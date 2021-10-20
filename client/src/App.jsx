import { Component } from "react";
import React from 'react';
import LoginForm from './LoginForm'
import Chatpage from './Chatpage'
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props); 
    this.chatRef = React.createRef();
    this.loginRef = React.createRef();

    this.handleLogin = this.handleLogin.bind(this)
    this.loginRedirect = this.loginRedirect.bind(this)
  }

  handleLogin(msgToken, streamToken, chatUrl) {
    this.chatRef.current.handleLogin(msgToken, streamToken, chatUrl);
  }
  
  loginRedirect() {
    document.getElementById('eventstream').innerHTML = '';
    document.getElementById('userlist').innerHTML = '';
    this.loginRef.current.showLogin();
  }

  //<LoginForm handleLogin={this.handleLogin}/>
  render() {
    return (
      <div className="App">
        <LoginForm ref={this.loginRef} handleLogin={this.handleLogin}/>
        <Chatpage ref={this.chatRef} loginRedirect = {this.loginRedirect}/>
      </div>
    );
  }
}
export default App;
