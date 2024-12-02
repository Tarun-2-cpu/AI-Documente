import React from "react";
import Header from "../../../components/Common/Header";
import ECommerceReceipt from "../../../components/Widgets/ECommerceReceipt";
import CustomerRatingsCard from "../../../components/Widgets/CustomerRatingsCard";
import ItemRatingCard from "../../../components/Widgets/ItemRatingCard";
import ProductCard from "../../../components/Widgets/ProductCard";
import ProductCard1 from "../../../components/Widgets/ProductCard1";
import AverageRatingCard from "../../../components/Widgets/AverageRatingCard";
import RatingbreakdownCard from "../../../components/Widgets/RatingbreakdownCard";
import Paymentform1Card from "../../../components/Widgets/Paymentform1Card";
import Paymentform2Card from "../../../components/Widgets/Paymentform2Card";
import ProductListCard from "../../../components/Widgets/ProductListCard";
import ProductDetailsCard from "../../../components/Widgets/ProductDetailsCard";
import ProductOrderListCard from "../../../components/Widgets/ProductOrderListCard";

import "../../../asset/css/ecommerce.css";

class ECommerceWidgets extends React.Component {
  render() {
      const { navigation} = this.props;
    return (
        <div className="container-fluid">
            <Header headerText="eCommerce  Widgets" mainNavigate="Widgets" currentPage="eCommerce "/>
            <div className="row clearfix">
               <div className="col-lg-6 col-md-12">
                  <ECommerceReceipt />
                  <CustomerRatingsCard />
               </div>
               <div className="col-lg-6 col-md-12">
                  <ItemRatingCard />
                  <div className="row">
                    <div className="col-lg-6 col-md-6">
                        <ProductCard />
                        <ProductCard1
                            ItemName="BEATS HEADPHONE"
                            ItemType="RED"
                            Catagory="BEATS"
                            Item="HEADPHONE"
                            Price="12.95"
                            imageUrl={require("../../../asset/images/ecommerce/wireless-red-quarter.jpg")}
                         />
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <AverageRatingCard />
                      <RatingbreakdownCard />
                      <ProductCard1
                            ItemName="CAMERA LENS"
                            ItemType="CAMERA"
                            Catagory="GADGET"
                            Item="LENS"
                            Price="56.25"
                            imageUrl={require("../../../asset/images/ecommerce/Canon-70-200mm.jpg")}
                         />
                    </div>
                  </div>
               </div>
            </div>
            <div className="row clearfix">
              <div className="col-lg-6 col-md-12">
                <Paymentform1Card />
              </div>
              <div className="col-lg-6 col-md-12">
                <Paymentform2Card />
              </div>
            </div>
            <div className="row clearfix">
              <div className="col-lg-12">
                <ProductListCard />
                <ProductDetailsCard />
              </div>
              <div className="col-lg-12">
                  <ProductOrderListCard />
              </div>
            </div>
        </div>
    
    );
  }
}
export default ECommerceWidgets;
