import { Component } from "react";
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
    this.handleLogin = this.handleLogin.bind(this)
  }

  handleLogin(msgToken, streamToken) {
    
    this.setState({message_token: msgToken, stream_token: streamToken})
    console.log("Chatpage" +msgToken)
    const server = new EventSource("http://localhost:3001/stream/" + streamToken);
    
    server.addEventListener("message", (event) => {
      if (event.data === "Goodbye!") {
        console.log("Closing SSE connection");
        server.close();
      } else {
        console.log(event.data);
      }
    });
    
    server.onerror = (event) => {
      console.log("Connection lost, reestablishing");
    };
  }

  //<LoginForm handleLogin={this.handleLogin}/>
  render() {
    return (
      <div className="App">
        
        <Chatpage/>
      </div>
    );
  }
}
export default App;
