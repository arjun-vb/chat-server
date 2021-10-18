import { Component } from "react";
import React from 'react';
import Stream from './Stream'
import Users from './Users'
import Message from './Message'
import "./chat.css";

class Chatpage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message_token: "",
      stream_token: "",
      chatUrl: "",
      isVisible: false
    }
   
    this.appendData = this.appendData.bind(this);
    this.streamMessage = this.streamMessage.bind(this);
    this.streamRef = React.createRef();
    this.userRef = React.createRef();
  }

  streamMessage(data) {
    var auth = "Bearer " + this.state.message_token;
    const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Authorization': auth

        },
        body: JSON.stringify({ message: data})
    };

    fetch(this.state.chatUrl + '/message', requestOptions)
            .then(response => response.json())
            .then(data => this.updateMessageToken(data));

    this.appendData(data);
    //this.userRef.current.addUser(data);
  }

  appendData(data) {
    this.streamRef.current.appendData(data);
  }

  updateMessageToken(data) {
    this.setState({message_token: data.Token})
  }

  /*{
      headers :{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Allow-Origin': '*'

      }*/

  handleLogin(msgToken, streamToken, chatUrl) {
    this.setState({message_token: msgToken, stream_token: streamToken, chatUrl: chatUrl, isVisible: true})
    //console.log("Chatpage" +msgToken)
    const server = new EventSource("http://localhost:3001/stream/" + streamToken);
    
    server.addEventListener("Message", (event) => {
      //var entry = event.lastEventId + " " +event.data + " "
      var data = JSON.parse(event.data);
      var fulldate = new Date(data.created * 1000);
      var timestamp = fulldate.toLocaleDateString('en-US') + " " +fulldate.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit', hour12: true })
      var messages = data.message;
      for(var i = 0; i < messages.length; i++) {
        var entry = timestamp + " (" + data.user + ") " + messages[i];
        this.appendData(entry);
      }

    });

    server.addEventListener("Join", (event) => {

      var data = JSON.parse(event.data);
      var fulldate = new Date(data.created * 1000);
      var timestamp = fulldate.toLocaleDateString('en-US') + " " +fulldate.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit', hour12: true })

      var entry = timestamp + " JOIN: " + data.user;
      this.addUser(data.user);
      this.appendData(entry);
    });

    server.addEventListener("Users", (event) => {
      
      var data = JSON.parse(event.data);
      var users = data.users;
      for(var i = 0; i < users.length; i++) {
        this.addUser(users[i]);
      }
    });

    server.addEventListener("Disconnect", (event) => {
      this.setState({isVisible: false});
      server.close();
    });
    
    server.addEventListener("Part", (event) => {
      var data = JSON.parse(event.data);
      var fulldate = new Date(data.created * 1000);
      var timestamp = fulldate.toLocaleDateString('en-US') + " " +fulldate.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit', hour12: true })

      var entry = timestamp + " PART: " + data.user;
      this.removeUser(data.user);
      this.appendData(entry);
    });

    server.addEventListener("ServerStatus", (event) => {
      
      var data = JSON.parse(event.data);
      var fulldate = new Date(data.created * 1000);
      var timestamp = fulldate.toLocaleDateString('en-US') + " " +fulldate.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit', hour12: true })
      var status = timestamp + " STATUS: " + data.status;
      
      this.appendData(status);
    });

    server.onerror = (event) => {
      console.log("Connection lost, reestablishing");
    };
  }

  removeUser(username) {
    this.userRef.current.removeUser(username);
  }

  addUser(username) {
    this.userRef.current.addUser(username);
  }

  render() {
    return (
      <div class={this.state.isVisible ? "" : "hide"} >
        <div>
          <h1>Chat Stream</h1>
        </div>
        <div>
          <div class='stream'><Stream ref={this.streamRef}/></div>
          <div class='users'><Users ref={this.userRef}/></div>
        </div>
        <div>
          <div class='message'><Message appendData={this.streamMessage}/></div>
          <div class='placeholder'></div>
        </div>
      </div>
    );
  }
}

export default Chatpage;
