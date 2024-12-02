import React from "react";

import Header from "../../../components/Common/Header";
import ColorsCard from "../../../components/ElementsUI/ColorsCard";
import ContextualTextColorsCard from "../../../components/ElementsUI/ContextualTextColorsCard";
import BackgroundColorCard from "../../../components/ElementsUI/BackgroundColorCard";
import BackgroundGradientColorCard from "../../../components/ElementsUI/BackgroundGradientColorCard";

class ColorsUI extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Colors" mainNavigate="UI Elements" currentPage="Colors"/>
            <div className="row clearfix">
               <div className="col-lg-6 col-md-12">
                    <ColorsCard />
               </div>
               <div className="col-lg-6 col-md-12">
                    <ContextualTextColorsCard />
               </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12 col-md-12">
                    <BackgroundColorCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12 col-md-12">
                    <BackgroundGradientColorCard />
                </div>
            </div>
        </div>
    
    );
  }
}
export default ColorsUI;
