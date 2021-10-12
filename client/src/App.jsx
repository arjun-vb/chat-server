import { Component } from "react";
import LoginForm from './LoginForm'
import Chatpage from './Chatpage'
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    const server = new EventSource("http://localhost:3001/stream/a");
    server.addEventListener("message", (event) => {
      if (event.data === "Goodbye!") {
        console.log("Closing SSE connection");
        server.close();
      } else {
        console.log(event.data);
      }
    });
    server.onerror = (_event) => {
      console.log("Connection lost, reestablishing");
    };
  }

  render() {
    return (
      <div className="App">
        <LoginForm/>
        <Chatpage/>
      </div>
    );
  }
}
export default App;
