import React, { Component } from 'react';

import './App.css';
import LineChart, { parseFlatArray } from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';

export default class App extends Component {
    render() {
        const data = [
            {
                color: "steelblue",
                points: [{x: 0.000443881332631, y: 0.00150128915014}, {x: 0.000587574392946, y: 0.00375625399053}, {x: 0.00123946655115, y: 0.00633799771227}, {x: 0.00354334941516, y: 0.0119844615356}]
            }
        ];
        const otherData = [
            {
                "asset_a": 0.235067,
                "asset_b": 0.286836,
                "asset_c": 0.001546,
                "asset_d": 0.368534,
                "asset_e": 0.108017,
                "return": 0.00375625399053,
                "variance": 0.000587574392946,
                "sharpe": 0.154961396104
            },
            {
                "asset_a": 0.013638,
                "asset_b": 0.370651,
                "asset_c": 0.000000,
                "asset_d": 0.615711,
                "asset_e": 0.000000,
                "return": 0.00633799771227,
                "variance": 0.00123946655115,
                "sharpe": 0.154961396104
            }
            ];
        const otherDataFlat = parseFlatArray(otherData, "variance", "return");

        return (
            <div>
                <div className="App">
                    <h1>Markowitz</h1>
                    <LineChart
                        width={600}
                        height={400}
                        xLabel="Standard Deviation"
                        yLabel="Expected Return"
                        xMin="0"
                        xMax="0.01"
                        yMin="0"
                        yMax="0.01"
                        onPointHover={(obj) => `asset_a: ${obj.asset_a}<br />`
                        + `asset_b: ${obj.asset_b}<br />` + `asset_c: ${obj.asset_c}<br />`
                        + `asset_d: ${obj.asset_d}<br />` + `asset_e: ${obj.asset_e}<br />`}
                        //showLegends
                        legendPosition="bottom-right"
                        data={data}
                    />
                </div>
            </div>
        );
    }
}
//line from risk free point to tangency portfolio point
//start point can be changed from risk free point to something else
//prepare docker installation - dockerize - docker compose
//onpointhover assets
//add more points

/*
 Optimal weights:
 asset_a    0.235067
 asset_b    0.286836
 asset_c    0.001546
 asset_d    0.368534
 asset_e    0.108017
 dtype: float64

 Expected return:   0.00375625399053
 Expected variance: 0.000587574392946
 Expected Sharpe:   0.154961396104

 Expected return:   0.00150128915014
 Expected variance: 0.000443881332631
 Expected Sharpe:   0.0712575531382

 Expected return:   0.00633799771227
 Expected variance: 0.00123946655115
 Expected Sharpe:   0.180025768076

 Expected return:   0.0119844615356
 Expected variance: 0.00354334941516
 Expected Sharpe:   0.201331410159
 */
