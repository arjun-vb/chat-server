import { Component } from "react";
import "./chat.css";

class Stream extends Component {

  constructor(props) {
    super(props); 
    this.state = {
      messageList : []
    }
  }
  
  appendData(message) {
    this.setState({
      messageList: this.state.messageList.concat(message)
    })
  }

  clearAllMessages() {
    this.setState({
      messageList: []
    })
  }
  
  render() {
    return (
      <div id="eventstream">
        {this.state.messageList.map(message => (
          <div>{message}</div>
        ))}  
      </div>
    );  
  }
}

export default Stream;