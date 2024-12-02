import React from "react";
import Header from "../../../components/Common/Header";
import DefaultMediaCard from "../../../components/ElementsUI/DefaultMediaCard";
import MediaAlignmentCard from "../../../components/ElementsUI/MediaAlignmentCard";

class MediaObjectUI extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Media Object" mainNavigate="UI Elements" currentPage="Media Object"/>
            <div className="row clearfix">
               <div className="col-lg-12 col-md-12">
                   <DefaultMediaCard />
               </div>
            </div>
            <div className="row clearfix">
               <div className="col-lg-12 col-md-12">
                  <MediaAlignmentCard />
               </div>
            </div>
        </div>
    
    );
  }
}
export default MediaObjectUI;
