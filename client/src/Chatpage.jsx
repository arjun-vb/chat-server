import { Component } from "react";
import React from 'react';
import Stream from './Stream'
import Users from './Users'
import Message from './Message'
import "./chat.css";

class Chatpage extends Component {
  constructor(props) {
    super(props);
   
    this.appendData = this.appendData.bind(this);
    this.streamRef = React.createRef();
  }

  appendData(data) {
    this.streamRef.current.appendData(data);
  }

  render() {
    return (
      <div>
        <div>
          <h1>Chat Stream</h1>
        </div>
        <div>
          <div class='stream'><Stream ref={this.streamRef}/></div>
          <div class='users'><Users/></div>
        </div>
        <div>
          <div class='message'><Message appendData={this.appendData}/></div>
          <div class='placeholder'></div>
        </div>
      </div>
    );
  }
}

export default Chatpage;
