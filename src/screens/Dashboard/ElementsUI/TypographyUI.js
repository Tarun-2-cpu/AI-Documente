import React from "react";
import Header from "../../../components/Common/Header";
import HeaderCard from "../../../components/ElementsUI/HeaderCard";
import ParagraphCard from "../../../components/ElementsUI/ParagraphCard";
import TextStyleCard from "../../../components/ElementsUI/TextStyleCard";
import OtherStyleCard from "../../../components/ElementsUI/OtherStyleCard";

class TypographyUI extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Typography" mainNavigate="UI Elements" currentPage="Typography "/>
            <div className="row clearfix">
                <div className="col-lg-12 col-md-12">
                    <HeaderCard />
                </div>
                <div className="col-lg-12 col-md-12">
                    <ParagraphCard />
                </div>
                <div className="col-lg-12 col-md-12">
                    <TextStyleCard />
                </div>
                <div className="col-lg-12 col-md-12">
                    <OtherStyleCard />
                </div>
            </div>
        </div>
    
    );
  }
}
export default TypographyUI;
