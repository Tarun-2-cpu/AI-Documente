import React from "react";
import Header from "../../../components/Common/Header";
import AlertMessagesCard from "../../../components/ElementsUI/AlertMessagesCard";
import AlertMessageswithLinkCard from "../../../components/ElementsUI/AlertMessageswithLinkCard";
import AlertMessageswithIconCard from "../../../components/ElementsUI/AlertMessageswithIconCard";
import LabelsCard from "../../../components/ElementsUI/LabelsCard";
import ModalsCard from "../../../components/ElementsUI/ModalsCard";
import AccordionCard from "../../../components/ElementsUI/AccordionCard";
import PaginationCard from "../../../components/ElementsUI/PaginationCard";
import TooltipsCard from "../../../components/ElementsUI/TooltipsCard";
import PopoversCard from "../../../components/ElementsUI/PopoversCard";
import PositionCard from '../../../components/ElementsUI/PositionCard';
import BordersCard from "../../../components/ElementsUI/BordersCard";

class BootstrapUI extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Bootstrap UI" mainNavigate="UI Elements" currentPage="Bootstrap UI"/>
            <div className="row clearfix">
               <div className="col-lg-6 col-md-12">
                    <AlertMessagesCard />
               </div>
               <div className="col-lg-6 col-md-12">
                    <AlertMessageswithLinkCard />
               </div>
               <div className="col-lg-12">
                    <AlertMessageswithIconCard />
               </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <LabelsCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <ModalsCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <AccordionCard/>
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <PaginationCard/>
                </div>
                <div className="col-lg-12">
                    <TooltipsCard />
                </div>
                <div className="col-lg-12">
                    <PopoversCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <PositionCard/>
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <BordersCard/>
                </div>
            </div>
        </div>
    
    );
  }
}
export default BootstrapUI;
