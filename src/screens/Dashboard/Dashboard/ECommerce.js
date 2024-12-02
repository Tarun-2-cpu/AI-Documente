import React from "react";
import Header from "../../../components/Common/Header";
import ECommerceDisplayCard from "../../../components/Dashboard/ECommerceDisplayCard";
import CategoryCard from "../../../components/Dashboard/CategoryCard";
import AnnualReportCard from "../../../components/Dashboard/AnnualReportCard";
import NewOrdersCard from "../../../components/Dashboard/NewOrdersCard";
import TopSellingCountryCard from "../../../components/Dashboard/TopSellingCountryCard";
import RecentTransactionsCard from "../../../components/Dashboard/RecentTransactionsCard";
import {ECommerceDisplayCardData} from "../../../Data/AnalyticalData";

class ECommerce extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="eCommerce" mainNavigate="Dashboard" currentPage="eCommerce" />
            <div className="row clearfix row-deck">
              {
                ECommerceDisplayCardData.map((data,i)=>{
                  return <ECommerceDisplayCard
                            header={data.header}
                            value={data.value}
                            per={data.per}
                            icon={data.icon}
                            data={data.data}
                            background={data.background}
                           />
                })
              }
            </div>
            <div className="row clearfix row-deck">
              <CategoryCard />
              <AnnualReportCard />
            </div>
            <div className="row clearfix row-deck">
              <NewOrdersCard />
              <TopSellingCountryCard /> 
            </div>
            <div className="row clearfix ">
              <RecentTransactionsCard />
            </div>
           
        </div>
    
    );
  }
}
export default ECommerce
