import React from "react";

import Header from "../../../components/Common/Header";
import BlogSparkelCard from "../../../components/Apps/BlogSparkelCard";
import BlogPieCard from "../../../components/Apps/BlogPieCard";
import ReturnVisitorCard from "../../../components/Apps/ReturnVisitorCard";
import BounceRateCard from "../../../components/Apps/BounceRateCard";
import BlogVisitorsStatisticsCard from "../../../components/Apps/BlogVisitorsStatisticsCard";
import BlogMarketingCampaignCard from "../../../components/Apps/BlogMarketingCampaignCard";
import {blogsparkleCardData,blogPieCardData} from "../../../Data/AppData";

class BlogDashboard extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Dashboard" mainNavigate="App" currentPage="Blog"/>
            <div className="row clearfix row-deck">
                {
                    blogsparkleCardData.map((data,i)=>{
                        return <BlogSparkelCard
                                key={i}
                                heading={data.heading}
                                perText={data.perText}
                                money={data.money}
                                icon={data.icon}
                                sparklineData={data.sparklineData}
                                 />
                    })
                }
                
            </div>
            <div className="row clearfix row-deck">
                {
                    blogPieCardData.map((data,i)=>{
                        return <BlogPieCard
                                key={"key"+i}
                                heading={data.heading}
                                per={data.per}
                                value={data.value}
                                color={data.color}
                                 />
                    })
                }
                
            </div>
            <div className="row clearfix row-deck">
                <ReturnVisitorCard />
                <BounceRateCard />
            </div>
            <div className="row clearfix row-deck">
                <BlogVisitorsStatisticsCard />
                <BlogMarketingCampaignCard />
            </div>
        </div>
    
    );
  }
}
export default BlogDashboard
