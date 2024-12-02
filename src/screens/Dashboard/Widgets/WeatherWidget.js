import React from "react";
import Header from "../../../components/Common/Header";
import WeatherDetailsCard from "../../../components/Widgets/WeatherDetailsCard";
import Weather4Card from "../../../components/Widgets/Weather4Card";
import Weather5Card from "../../../components/Widgets/Weather5Card";
import Weather6Card from '../../../components/Widgets/Weather6Card';
import Weather3Card from "../../../components/Widgets/Weather3Card";
import WeatherCard from "../../../components/Widgets/WeatherCard";

class WeatherWidget extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Weather Widgets" mainNavigate="Widgets" currentPage="Weather"/>
            <div className="row">
                <WeatherDetailsCard />
                <div className="col-lg-4 col-md-6">
                    <Weather4Card />
                    <Weather5Card />
                    <Weather6Card />
                    
                </div>
                <div className="col-lg-4 col-md-6">
                    <Weather3Card />
                </div>
                <div className="col-lg-6 col-md-12">
                    <WeatherCard />
                </div>
            </div>
        </div>
    
    );
  }
}
export default WeatherWidget;
