import React from "react";
import Header from "../../../components/Common/Header";
import ButtonsTypeCard from "../../../components/ElementsUI/ButtonsTypeCard";
import ButtonTagsCard from "../../../components/ElementsUI/ButtonTagsCard";
import ButtonsOutlineCard from "../../../components/ElementsUI/ButtonsOutlineCard";
import ButtonGroupCard from "../../../components/ElementsUI/ButtonGroupCard";
import ButtonListCard from "../../../components/ElementsUI/ButtonListCard";

class ButtonsUI extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Buttons" mainNavigate="UI Elements" currentPage="Buttons "/>
            <div className="row clearfix">
               <div className="col-lg-12">
                    <ButtonsTypeCard />
               </div>
               <div className="col-lg-12">
                    <ButtonTagsCard />
               </div>
               <div className="col-lg-12">
                    <ButtonsOutlineCard />
               </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <ButtonGroupCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <ButtonListCard />
                </div>
            </div>
        </div>
    
    );
  }
}
export default ButtonsUI;
