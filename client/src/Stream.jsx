import { Component } from "react";
import "./chat.css";

class Stream extends Component {
  
  appendData(message) {
    
    var newdiv = document.createElement('div');
    newdiv.innerHTML = message;
    document.getElementById('eventstream').appendChild(newdiv);
    
  }
  

  render() {
    return (
      <div id="eventstream">     
      </div>
    );  
  }
}

export default Stream;
