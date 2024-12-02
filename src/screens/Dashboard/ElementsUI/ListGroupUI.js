import React from "react";
import Header from "../../../components/Common/Header";
import BasicListGroup from "../../../components/ElementsUI/BasicListGroup";
import ActivatedListGroup from "../../../components/ElementsUI/ActivatedListGroup";
import DisabledListGroupCard from "../../../components/ElementsUI/DisabledListGroupCard";
import LinksAndButtonsListCard from "../../../components/ElementsUI/LinksAndButtonsListCard";
import FlushListGroupCard from "../../../components/ElementsUI/FlushListGroupCard";
import ListGroupWithbadges from "../../../components/ElementsUI/ListGroupWithbadges";
import ListGroupColor from "../../../components/ElementsUI/ListGroupColor";
import CustomContentListGroup from "../../../components/ElementsUI/CustomContentListGroup";

class ListGroupUI extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="List Group" mainNavigate="UI Elements" currentPage="List Group"/>
            <div className="row clearfix">
               <div className="col-md-12">
                 <BasicListGroup />
               </div>
            </div>
            <div className="row clearfix">
               <div className="col-lg-6 col-md-12">
                    <ActivatedListGroup />
               </div>
               <div className="col-lg-6 col-md-12">
                    <DisabledListGroupCard />
               </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12 col-md-12">
                    <LinksAndButtonsListCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-6 col-md-12">
                    <FlushListGroupCard />
                </div>
                <div className="col-lg-6 col-md-12">
                    <ListGroupWithbadges />
                </div>
            </div>
            <div className="row clearfix">
               <div className="col-md-12">
                 <ListGroupColor />
                 <CustomContentListGroup />
               </div>
            </div>
        </div>
    
    );
  }
}
export default ListGroupUI;
