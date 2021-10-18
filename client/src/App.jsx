import { Component } from "react";
import React from 'react';
import LoginForm from './LoginForm'
import Chatpage from './Chatpage'
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);    
    this.state = {
      message_token: "",
      stream_token: ""
    }
    this.chatRef = React.createRef();
    this.handleLogin = this.handleLogin.bind(this)
  }

  handleLogin(msgToken, streamToken, chatUrl) {
    this.chatRef.current.handleLogin(msgToken, streamToken, chatUrl);
  }

  //<LoginForm handleLogin={this.handleLogin}/>
  render() {
    return (
      <div className="App">
        <LoginForm handleLogin={this.handleLogin}/>
        <Chatpage ref={this.chatRef}/>
      </div>
    );
  }
}
export default App;
