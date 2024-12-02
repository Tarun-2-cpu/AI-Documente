import React from "react";
import Header from "../../../components/Common/Header";
import BlogListMainCard from "../../../components/Apps/BlogListMainCard";
import BlogReplyCard from "../../../components/Apps/BlogReplyCard";
import SocialNewPostCard from "../../../components/Widgets/SocialNewPostCard";
import BlogPhotographCard from "../../../components/Widgets/BlogPhotographCard";
import BlogCommentsCard from "../../../components/Apps/BlogCommentsCard";
import CategoriesCloudsCard from "../../../components/Apps/CategoriesCloudsCard";
import EmailNewsletterCard from "../../../components/Apps/EmailNewsletterCard";
import InstagramPostCard from "../../../components/Apps/InstagramPostCard";
import SocialCounterCard from "../../../components/Widgets/SocialCounterCard";
import BlogSearchCard from "../../../components/Apps/BlogSearchCard";
import BlogAboutMe from "../../../components/Widgets/BlogAboutMe";
import BlogPhotoSliderCard from "../../../components/Widgets/BlogPhotoSliderCard";

import imge1 from "../../../asset/images/blog/blog-page-1.jpg";

class BlogWidgets extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="Blog Widgets" mainNavigate="Widgets" currentPage="Blog"/>
            <div className="row clearfix">
               <div className="col-lg-6 col-md-12">
                    <BlogListMainCard imageUrl={imge1}/>
                    <BlogReplyCard />
               </div>
               <div className="col-lg-6 col-md-12">
                    <SocialNewPostCard />
                    <BlogPhotographCard />
               </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-8 col-md-12">
                    <BlogCommentsCard /> 
                </div>
                <div className="col-lg-4 col-md-12">
                    <CategoriesCloudsCard />
                    <EmailNewsletterCard />
                </div>
            </div>
            <div className="row clearfix">
                <div className="col-lg-4 col-md-12">
                    <SocialCounterCard />
                    <InstagramPostCard />
                    <BlogAboutMe />
                </div>
                <div className="col-lg-8 col-md-12">
                    <BlogSearchCard />
                    <BlogPhotoSliderCard onClickRead={()=>{ navigation.navigate("blogDetails") }} />
                </div>
            </div>
        </div>
    
    );
  }
}
export default BlogWidgets;
