import React from "react";
import ReactEcharts from "echarts-for-react";

class UsedCardIOT extends React.Component {
  render() {
    return (
        <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="card">
                        <div className="header">
                            <h2>Day/Night Use</h2>
                            <ul className="header-dropdown">
                                <li className="dropdown">
                                    <a href="" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"></a>
                                    <ul className="dropdown-menu dropdown-menu-right">
                                        <li><a href="">Action</a></li>
                                        <li><a href="">Another Action</a></li>
                                        <li><a href="">Something else</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="body">
                        <ReactEcharts
                        option={{
                            color: ['rgb(89, 196, 188)', 'rgb(99, 122, 174)','rgb(47, 170, 161)'],
                            tooltip: {
                                trigger: 'item',
                                formatter: '{b}: {d}%'
                            },
                            legend: {
                                top:250,
                                data: ['Day','Night']
                            },
                            series: [
                                {
                                    name: '',
                                    type: 'pie',
                                    top:-15,
                                    radius: ['50%', '90%'],
                                    avoidLabelOverlap: true,
                                    label: {
                                        show: true,
                                        fontSize: '10',
                                        position: 'inner',
                                        formatter: '{d}%',
                                        color:'#fff  '
                                    },
                                    emphasis: {
                                        label: {
                                            show: false,
                                            fontSize: '30',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    labelLine: {
                                        show: true
                                    },
                                    data: [
                                        {value: 50, name: 'Day'},
                                        {value: 35, name: 'Night'},
                                    ]
                                }
                            ]
                        }}
                          opts={{renderer: 'svg'}} // use svg to render the chart.
                            
                        />
                        </div>
                    </div>
        </div>
    );
  }
}
export default UsedCardIOT
