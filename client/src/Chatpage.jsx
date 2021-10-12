import { Component } from "react";
import "./App.css";

class Chatpage extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    
  }


  render() {
    return (
      <div>
        <div>
          <h1>Chat Stream</h1>
        </div>
        <div>
          <div class='stream'>Stream</div>
          <div class='user'>online users</div>
        </div>
        <div>
          <input type="text"/>
        </div>
      </div>
    );
  }
}

export default Chatpage;
