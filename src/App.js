import React, { Component } from 'react';

import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';
import { parseJsonArray, parseGroupingBy } from './utils/Parser'
import { getData } from './utils/DataService'

const jsonData = require('./testData/data.json');
const jsonData2 = require('./testData/data2.json');
const jsonData3 = require('./testData/data3.json');


export default class App extends Component {

  componentWillMount() {
    this.state = {
      loading: true,
      data: ''
    }
    getData().then((json) => {
      this.setState({
        data: json,
        loading: false
      })
    })
    .catch(error => console.log(error) );
  }

  render() {

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }

    let jsonCallArray = this.state.data.EfficientPortfolios.Points
    //let pointsArray = jsonData2.EfficientPortfolios.Points
    let finalArray = jsonCallArray.concat(jsonData3.CML.OptimalPorfolio.OP.Portfolio)

    console.log(JSON.stringify(this.state.data, null, 2))

    const jsonDataParsed = parseJsonArray(jsonData.Points, "volatility", "return")
    const jsonDataParsed2 = parseGroupingBy(finalArray, "volatility", "return", "id")
    const jsonDataFromCall = parseJsonArray(jsonCallArray, "volatility", "return")

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
                        pointRadius={2}
                        xMin="0"
                        xMax="1"
                        yMin={0}
                        //yMax={1}
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
