import { Component } from "react";

import "./chat.css";

class Stream extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    this.displayData = []
    
  }

  appendData(message) {
    this.displayData.push("<div>" + message + "<div/>")
    console.log(this.displayData)
  }

  render() {
    return (
      <div class='instream'>
      	Stream Events
        <div class='msgdiv'>
          {this.displayData}
        </div>        
      </div>
    );
  }
}

export default Stream;
