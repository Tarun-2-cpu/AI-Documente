import React from "react";
import Header from "../../../components/Common/Header";
import RoundRangeSlidersDefaultCard from "../../../components/ElementsUI/RoundRangeSlidersDefaultCard";
import RoundRangeSlidersCard from "../../../components/ElementsUI/RoundRangeSlidersCard";
import MaterialDesignStyleRangeSlidersCard from "../../../components/ElementsUI/MaterialDesignStyleRangeSlidersCard";
import TabsWithOnlyIconTitleCard from "../../../components/ElementsUI/TabsWithOnlyIconTitleCard";

import "../../../asset/vendor/material-rangeslider/style.css"

class RangeSlidersUI extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Range Sliders" mainNavigate="UI Elements" currentPage="Range Sliders"/>
            <div className="row clearfix">
               <div className="col-md-12">
                    <RoundRangeSlidersDefaultCard />
               </div>
               <div className="col-md-12">
                    <RoundRangeSlidersCard />
               </div>
            </div>
            <div className="row clearfix">
              <div className="col-md-12">
                  <MaterialDesignStyleRangeSlidersCard />
              </div>
            </div>
            <div className="row clearfix">
              <div className="col-md-12">
                  <TabsWithOnlyIconTitleCard />
              </div>
            </div>
           
            
        </div>
    
    );
  }
}
export default RangeSlidersUI;
