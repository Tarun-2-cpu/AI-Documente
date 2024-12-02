import React from "react";
import Header from "../../../components/Common/Header";
import FirstCardDemographic from "../../../components/Dashboard/FirstCardDemographic";
import HouseholdIncomeCardDemographic from "../../../components/Dashboard/HouseholdIncomeCardDemographic";
import ConversionCardDemographic from "../../../components/Dashboard/ConversionCardDemographic";
import {DemographicFirstCardData} from "../../../Data/AnalyticalData";
import ChannelsCardDemographic from "../../../components/Dashboard/ChannelsCardDemographic";
import ConversionGenderCardDemographic from "../../../components/Dashboard/ConversionGenderCardDemographic";
import MapCardDemographic from "../../../components/Dashboard/MapCardDemographic";

class Demographic extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Demographic" mainNavigate="Dashboard" currentPage="Demographic" />
            <div className="row clearfix row-deck">
                {
                    DemographicFirstCardData.map((data,i)=>{
                            return <FirstCardDemographic
                                    key={i}
                                    header={data.header}
                                    money={data.money}
                                    per={data.per}
                                    back={data.back}
                                    status={data.status}
                                     />
                    })
                }
                
            </div>
            <div className="row clearfix row-deck">
                <HouseholdIncomeCardDemographic />
                <ConversionCardDemographic />
                <ChannelsCardDemographic />
            </div>
            <div className="row clearfix row-deck">
                <ConversionGenderCardDemographic />
                <MapCardDemographic />
            </div>

        </div>
    
    );
  }
}
export default Demographic
