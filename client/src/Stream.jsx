import { Component } from "react";
import "./chat.css";

class Stream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
    
  }

  appendData(message) {
    
    var newdiv = document.createElement('div');
    newdiv.innerHTML = message;
    document.getElementById('eventstream').appendChild(newdiv);
    
    //parent.scrollTop = 9999999;
    //this.state.displayData.push({id:this.state.displayData.length, msg: message})
    //this.state.displayData.push(message)
    //console.log(this.state.displayData)
    //var eventstream=document.getElementById('eventstream');//parent.scrollHeight - parent.clientHeight;
    //parent.scrollTop = parent.scrollHeight;
    //eventstream.appendChild(<div>message</div>);
    //this.state.displayData.map(function(msg){               return <div>{msg}</div>;            })}
    //<div>{this.state.displayData}</div>      <Message/> <div class='msgdiv'>
    //const msgs = this.state.displayData.map(msg=> <Test key={msg.id} message={msg.msg}/>)
    //console.log(msgs)
  }
  

  render() {
    return (
      <div id="eventstream">     
      </div>
    );  
  }
}

export default Stream;
