import React from "react";
import Header from "../../../components/Common/Header";
import SocialNewPostCard from "../../../components/Widgets/SocialNewPostCard";
import SocialGraphCard from "../../../components/Widgets/SocialGraphCard";
import SocialUserCard from "../../../components/Widgets/SocialUserCard";
import SocialUser2Card from "../../../components/Widgets/SocialUser2Card";
import SocialAddCard from "../../../components/Widgets/SocialAddCard";
import SocialSideMenuCard from "../../../components/Widgets/SocialSideMenuCard";
import SocialTwitterFeedCard from "../../../components/Widgets/SocialTwitterFeedCard";
import SocialFollowersCard from "../../../components/Widgets/SocialFollowersCard";
import SocialMediaCard from "../../../components/Widgets/SocialMediaCard";
import SocialFollowersListCard from "../../../components/Widgets/SocialFollowersListCard";
import SocialIconCard from "../../../components/Widgets/SocialIconCard";
import SocialStoriesCard from "../../../components/Widgets/SocialStoriesCard";
import SocialUserProfileCard from "../../../components/Widgets/SocialUserProfileCard";

import {SocialIconCardData} from "../../../Data/WidgetsData";

class SocialWidget extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Social Widgets" mainNavigate="Widgets" currentPage="Social"/>
            <div className="row clearfix">
                <div className="col-lg-6 col-md-12">
                  <SocialNewPostCard />
                </div>
               <SocialGraphCard name="Twitter" per={56} graphValue={66} graphColor='rgb(76, 175, 80)'/>
               <SocialGraphCard name="Facebook" per={87} graphValue={26} graphColor='rgb(123, 105, 236)'/>
            </div>
            <div className="row clearfix">
                <div className="col-lg-4 col-md-12">
                    <SocialUserCard />
                    <SocialUser2Card />
                    <SocialAddCard
                     back='google w_feed'
                      data={[
                        {
                          icon:'fa fa-google-plus fa-2x',
                          date:'18th Feb',
                          offer:70,
                          postBy:'post form WrapTheme',
                         
                        },
                        {
                          icon:'fa fa-google-plus fa-2x',
                          date:'28th Mar',
                          offer:50,
                          postBy:'post form ThemeMakker',
                        },
                      ]}
                     />
                </div>
                <div className="col-lg-4 col-md-12">
                      <SocialSideMenuCard />
                      <SocialTwitterFeedCard />
                </div>
                <div className="col-lg-4 col-md-12">
                      <SocialFollowersCard />
                      <SocialAddCard
                     back='twitter w_feed'
                      data={[
                        {
                          icon:'fa fa-twitter fa-2x',
                          date:'18th Feb',
                          offer:70,
                          postBy:'post form WrapTheme',
                         
                        },
                        {
                          icon:'fa fa-twitter fa-2x',
                          date:'28th Mar',
                          offer:50,
                          postBy:'post form ThemeMakker',
                        },
                      ]}
                     />
                     <SocialAddCard
                     back='facebook w_feed'
                      data={[
                        {
                          icon:'fa fa-facebook fa-2x',
                          date:'18th Feb',
                          offer:70,
                          postBy:'post form WrapTheme',
                         
                        },
                        {
                          icon:'fa fa-facebook fa-2x',
                          date:'28th Mar',
                          offer:50,
                          postBy:'post form ThemeMakker',
                        },
                      ]}
                     />
                </div>
            </div>
            <div className="row clearfix">
              <SocialMediaCard />
              <SocialFollowersListCard />
            </div>
            <div className="row clearfix w_social3">
              {
                SocialIconCardData.map((d,i)=>{
                    return <SocialIconCard
                              key={i}
                              icon={d.icon}
                              header={d.header}
                              value={d.value}
                              classV={d.class}
                            />
                })
              }
                    
            </div>
            <div className="row clearfix">
              <SocialStoriesCard/>
              <SocialUserProfileCard />
            </div>
        </div>
    
    );
  }
}
export default SocialWidget;
