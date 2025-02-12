import React from "react";

import Header from "../../../components/Common/Header";
import ContactListCard from "../../../components/Apps/ContacListCard";
import ContacAddCard from "../../../components/Apps/ContacAddCard";
import {events} from "../../../Data/AppData";

class ContactList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            addModal:false
        }
    }
  render() {
      const { addModal} = this.state;
    return (
        <div className="container-fluid">
            <Header headerText="Contact List" mainNavigate="App" currentPage="Contact List" hideDownload hideSend showGrid showAdd onAdd={()=>{ this.setState({ addModal:true }) }}/>
            <div className="row clearfix row-deck">
                < ContactListCard />
            </div>
            <ContacAddCard show={addModal} onClose={()=>{ this.setState({ addModal:false }) }}/>
        </div>
    
    );
  }
}
export default ContactList
