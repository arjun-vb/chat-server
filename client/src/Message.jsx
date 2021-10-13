import { Component } from "react";
import Stream from './Stream'
import "./chat.css";

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    }
    
  }

  updateInput = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  entermessage = (event) => {
    if (event.key === 'Enter') { 
      event.preventDefault();
      this.props.appendData(this.state.message)
    }
  }


  render() {
    return (
      <div>
          <input type="text" value={this.state.message} onChange={this.updateInput} 
          onKeyPress={this.entermessage} class='msgtxt' name="message"/>
      </div>
    );
  }
}

export default Message;