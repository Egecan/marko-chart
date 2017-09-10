import React, { Component } from 'react';

import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';
import { parseJsonArray, parseGroupingBy } from './utils/Parser'

const jsonData = require('./testData/data.json');
const jsonData2 = require('./testData/data2.json');

export default class App extends Component {
    render() {

        let pointsArray = jsonData2.EfficientPortfolios.Points
        let finalArray = pointsArray.concat(jsonData2.CML.OptimalPorfolio.OP.Portfolio)
        console.log(finalArray)

        const jsonDataParsed = parseJsonArray(jsonData.Points, "volatility", "return")
        const jsonDataParsed2 = parseGroupingBy(finalArray, "volatility", "return", "id")

        return (
            <div>
                <div className="App">
                    <h1>Markowitz</h1>
                    <LineChart
                        width={900}
                        height={600}
                        xLabel="Standard Deviation"
                        yLabel="Expected Return"
                        interpolate="cardinal"
                        pointRadius={1}
                        xMin="0"
                        //xMax="1"
                        yMin={0}
                        //yMax="1"
                        onPointHover={ (obj) =>
                            `return: ${obj.y}<br />`
                            + `deviation: ${obj.x}<br />`
                            + `sharpe: ${obj.sharpe}<br />`
                            + obj.weights && obj.weights !== undefined
                                ? obj.weights.map(item => { return `${item.symbol}: ${item.weight}<br />` }).join('')
                                : ''
                        }
                        //showLegends
                        legendPosition="bottom-right"
                        data={jsonDataParsed2}
                    />
                </div>
            </div>
        );
    }
}
