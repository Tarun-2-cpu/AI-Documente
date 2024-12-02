import React from "react";
import Header from "../../../components/Common/Header";
import FeedsCard from '../../../components/Widgets/FeedsCard';
import SubscribeCard from '../../../components/Widgets/SubscribeCard';
import FollowersCard from '../../../components/Widgets/FollowersCard';
import ResentChatCard from '../../../components/Widgets/ResentChatCard';
import TeamCard from '../../../components/Widgets/TeamCard';
import BrowserStatsCard from "../../../components/Widgets/BrowserStatsCard";
import TimelineCard from '../../../components/Widgets/TimelineCard';
import MyStatsCard from "../../../components/Widgets/MyStatsCard";
import MainMenuCard from '../../../components/Widgets/MailMenuCard';
import TwitterFeedCard from '../../../components/Widgets/TwitterFeedCard';
import PricingCard from '../../../components/Widgets/PricingCard';
import LastCommentsCard from '../../../components/Widgets/LastCommentsCard';
import ToDoListCardWigets from '../../../components/Widgets/ToDoListCardWigets';
import WorkReportCard from '../../../components/Dashboard/WorkReportCard';
import JoinCard from '../../../components/Widgets/JoinCard';
import InvoiceCard from "../../../components/Widgets/InvoiceCard";

class DataWidgets extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Data Widgets" mainNavigate="Widgets" currentPage="Data"/>
            <div className="row clearfix">
                <div className="col-lg-4 col-md-12">
                    <FeedsCard />
                    <SubscribeCard />
                    <FollowersCard />
                    <ResentChatCard />
                    <TeamCard />
                    <BrowserStatsCard />
                </div>
                <div className="col-lg-4 col-md-12">
                    <TimelineCard />
                    <MyStatsCard />
                    <MainMenuCard />
                    <TwitterFeedCard />
                    <PricingCard />
                </div>
                <div className="col-lg-4 col-md-12">
                    <LastCommentsCard />
                    <ToDoListCardWigets/>
                    <WorkReportCard header="Referrals" />
                    <JoinCard />
                    <InvoiceCard />
                </div>
            </div>
        </div>
    
    );
  }
}
export default DataWidgets;
