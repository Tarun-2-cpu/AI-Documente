import React from "react";
import Header from "../../../components/Common/Header";
import SimpleTabsCard from "../../../components/ElementsUI/SimpleTabsCard";
import Tab2Card from "../../../components/ElementsUI/Tab2Card";
import Tab3Card from "../../../components/ElementsUI/Tab3Card";
import TabsWithIconCard from "../../../components/ElementsUI/TabsWithIconCard";
import TabsIconTitleCard from "../../../components/ElementsUI/TabsIconTitleCard";
import TabsWithDropdowns from "../../../components/ElementsUI/TabsWithDropdowns";
import PillsWithDropdowns from "../../../components/ElementsUI/PillsWithDropdowns";

class TabsUI extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Tabs" mainNavigate="UI Elements" currentPage="Tabs "/>
            <div className="row clearfix">
                <div className="col-lg-6 col-md-12">
                    <SimpleTabsCard />
                </div>
                <div className="col-lg-6 col-md-12">
                    <Tab2Card />
                </div>
                <div className="col-lg-12 col-md-12">
                    <Tab3Card />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <TabsWithIconCard />
                </div>
                <div className="col-lg-12">
                    <TabsIconTitleCard />
                </div>
                <div className="col-lg-12">
                    <TabsWithDropdowns />
                </div>
            </div>
            <div className="row clearfix">
            <div className="col-lg-12">
                    <PillsWithDropdowns />
                </div>
            </div>
        </div>
    
    );
  }
}
export default TabsUI;
