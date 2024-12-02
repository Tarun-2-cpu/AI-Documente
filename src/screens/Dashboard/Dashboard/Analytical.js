import React from "react";
import Header from "../../../components/Common/Header";
import SparkleCard from "../../../components/Dashboard/SparkleCard";
import NonSparkleCard from "../../../components/Dashboard/NonSparkleCard";
import GoogleAnalyticCard from "../../../components/Dashboard/GoogleAnalyticCard";
import DeviceAnalyticCard from "../../../components/Dashboard/DeviceAnalyticCard";
import AudienceAnalyticCard from "../../../components/Dashboard/AudienceAnalyticCard";
import BrowserAnalyticCard from "../../../components/Dashboard/BrowserAnalyticCard";
import {sparkleCardData,nonSparkleCardData} from "../../../Data/AnalyticalData";

class Analytical extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Analytical" mainNavigate="Dashboard" currentPage="Analytical" />
            <div className="row clearfix row-deck">
            {
                sparkleCardData.map((data,i)=>{
                    return <SparkleCard key={i} seriesData={data.sparklineData} height={data.height} heading = {data.heading} money={data.money} />
                })
            }
            {
                nonSparkleCardData.map((data,i)=>{
                    return <NonSparkleCard key={i} heading={data.heading} growth={data.growth} money={data.money} icon={data.icon} />
                })
            }
                
               
            </div>
            <div className="row clearfix row-deck">
                <GoogleAnalyticCard />
            </div>
            <div className="row clearfix row-deck">
                <DeviceAnalyticCard />
                <AudienceAnalyticCard />
                <BrowserAnalyticCard />
            </div>
        </div>
    
    );
  }
}
export default Analytical
