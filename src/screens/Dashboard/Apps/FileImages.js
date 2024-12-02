import React from "react";
import Header from "../../../components/Common/Header";
import FileImagesCard from "../../../components/Apps/FileImagesCard";
import {FileImagesCardData} from "../../../Data/AppData";

class FileImages extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="File Image" mainNavigate="App" currentPage="File Manager"/>
            <div className="row clearfix">
                {
                    FileImagesCardData.map((data,i)=>{
                        return <FileImagesCard 
                                imageUrl={data.imageUrl}/>
                    })
                }
            </div>
        </div>
    
    );
  }
}
export default FileImages;
