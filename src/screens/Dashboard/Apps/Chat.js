import React from "react";
import Header from "../../../components/Common/Header";
import ChatCard from "../../../components/Apps/ChatCard";
import "../../../asset/css/chatapp.css"

class Chat extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Inbox" mainNavigate="App" currentPage="Chat" />
            <div className="row clearfix ">
              <ChatCard />
              
            </div>
        </div>
    
    );
  }
}
export default Chat
