import { Component } from "react";
import "./chat.css";

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      disable: true
    }
    
  }

  updateInput = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  entermessage = (event) => {
    if (event.key === 'Enter') { 
      event.preventDefault();
      this.props.streamMessage(this.state.message)
      this.setState({message: ""})
    }
  }

  enableTextbox() {
    this.setState({message: "", disable: false})
  }
  
  disableTextbox() {
    this.setState({message: "Reconnect to send messages...", disable: true})
  }

  render() {
    return (
      <div>
          <input type="text" value={this.state.message} onChange={this.updateInput} disabled={this.state.disable} 
          onKeyPress={this.entermessage} class='msgtxt' name="message" id="postmessage" autoFocus/>
      </div>
    );
  }
}

export default Message;
