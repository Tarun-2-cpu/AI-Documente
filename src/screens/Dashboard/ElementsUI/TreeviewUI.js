import React from "react";
import Header from "../../../components/Common/Header";
import BootstrapTreeviewCard from "../../../components/ElementsUI/BootstrapTreeviewCard";

class TreeviewUI extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Treeview" mainNavigate="UI Elements" currentPage="Treeview"/>
            <div className="row clearfix">
               <div className="col-md-12">
                    <BootstrapTreeviewCard />
               </div>
               <div className="col-md-12">
            
               </div>
            </div>
            
           
            
        </div>
    
    );
  }
}
export default TreeviewUI;
