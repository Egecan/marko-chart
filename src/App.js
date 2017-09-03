import React, { Component } from 'react';

import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';
import { parseJsonArray } from './utils/Parser'

const jsonData = require('./testData/data.json');

export default class App extends Component {
    render() {

        const jsonDataParsed = parseJsonArray(jsonData.Points, "volatility", "return")

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
                            + obj.weights.map(item => { return `${item.symbol}: ${item.weight}<br />` }).join('')
                        }
                        //showLegends
                        legendPosition="bottom-right"
                        data={jsonDataParsed}
                    />
                </div>
            </div>
        );
    }
}
