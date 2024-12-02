import React from "react";
import Header from "../../../components/Common/Header";
import FmFolderCard from "../../../components/Apps/FmFolderCard";
import FmStorageCard from "../../../components/Apps/FmStorageCard";
import FmDetailsStorageCard from "../../../components/Apps/FmDetailsStorageCard";
import FmFileReportsCard from "../../../components/Apps/FmFileReportsCard";
import {fmFolderCardData,FmDetailsStorageCardData} from "../../../Data/AppData";

class FmDashboard extends React.Component {
  render() {
    return (
        <div className="container-fluid">
            <Header headerText="Dashboard" mainNavigate="App" currentPage="File Manager"/>
            <div className="row clearfix">
                {
                    fmFolderCardData.map((data,i)=>{
                        console.error(data);
                        return <FmFolderCard key={i}
                                name={data.name}
                                 />
                    })
                }
               
            </div>
            <div className="row clearfix">
                <div className="col-lg-3 col-md-5 col-sm-12">
                    <FmStorageCard />
                    {
                        FmDetailsStorageCardData.map((data,i)=>{
                            return <FmDetailsStorageCard
                                        name={data.name}
                                        per={data.per}
                                        usedSpace={data.usedSpace}
                                        color={data.color}
                                     />
                        })
                    }
                    
                </div>
                <FmFileReportsCard />
            </div>
        </div>
    
    );
  }
}
export default FmDashboard;
