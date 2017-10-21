import React, { Component } from 'react';

import d3 from "d3";
import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';
import { parseGroupingBy } from './utils/Parser';
import { getData, fileIsIncorrectFiletype, showInvalidFileTypeMessage, fileUpload } from './utils/DataService';

const jsonData = require('./testData/data4.json');


export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: jsonData,
      error: false,
      file: null,
      riskfree: 0.05,
      point: null
    }
    this.uploadFormSubmit = this.uploadFormSubmit.bind(this)
    this.fileChange = this.fileChange.bind(this)
    this.onClickLoadData = this.onClickLoadData.bind(this)
    this.onClickLineChart = this.onClickLineChart.bind(this)
    this.onHoverLineChart = this.onHoverLineChart.bind(this)
    this.updateCml = this.updateCml.bind(this)
  }

  uploadFormSubmit(e){
    e.preventDefault() // Stop form submit
    if (this.state.file == null || fileIsIncorrectFiletype(this.state.file)) {
      showInvalidFileTypeMessage()
    }
    else {
      this.setState({
        loading: true,
        data: '',
        error: false
      })
      fileUpload(this.state.file).then((json) => {
        this.setState({
          data: json,
          loading: false,
          riskfree: json.CML.OptimalPorfolio.riskfree_ret
        })
      })
          .catch(error => {
            console.log(error)
            this.setState({
              loading: false,
              error: true
            })
          });
      console.log(JSON.stringify(this.state.data, null, 2))
    }
  }
  fileChange(e) {
    //console.log(e)
    if (e.target.files[0] != null ) {
        this.setState({file: e.target.files[0]})
      }
    else {
      this.setState({file: null})
    }
  }

  updateCml(e) {
    console.log(e.target.value)
    if (e.target.value > 0.3 || e.target.value < 0) {
      window.alert("Please enter a value between 0 and 0.3");
    }
    else {
      this.setState({riskfree:Number(e.target.value)})
    }
  }

  onClickLoadData() {
    this.setState({
      loading: true,
      data: '',
      error: false,
      file: null
    })
    getData(this.state.riskfree).then((json) => {
      this.setState({
        data: json,
        loading: false,
        riskfree: json.CML.OptimalPorfolio.riskfree_ret
      })
    })
        .catch(error => {
          console.log(error)
          this.setState({
            loading: false,
            error: true
          })
        })
  }

  onClickLineChart(event, point) {
    console.log(point)
    this.setState({
      point: point
    })
  }
  onHoverLineChart = obj => {
    return ( `return: ${obj.y}<br />`
    + `deviation: ${obj.x}<br />`
    + `sharpe: ${obj.sharpe}<br />`
    + (obj.weights && obj.weights !== undefined
        ? obj.weights.map(item => { return `${item.symbol}: ${item.weight}<br />` }).join('')
        : '')
    )
  }

  render() {

    if (this.state.loading) {
      return <h2>Loading...</h2>;
    }
    if (this.state.error) {
      return <h2>Received an error from server...</h2>;
    }

    const tangentPoint = this.state.data.CML.OptimalPorfolio.OP.Portfolio
    const riskfreeValue = this.state.data.CML.OptimalPorfolio.riskfree_ret

    const riskfreePoint = {
      volatility: 0,
      return: riskfreeValue,
      name: tangentPoint.name
    }

    let portfolios = this.state.data.EfficientPortfolios.Points

    const userLineName = "user"

    for (let i = 0; i < portfolios.length; i++) {
      if (portfolios[i].name === tangentPoint.name) {
        portfolios.splice(i, portfolios.length - i)
        break;
      }
    }

    const tangentLineContVolatility = portfolios[portfolios.length - 1].volatility
    const slope = (tangentPoint.return - riskfreeValue) / tangentPoint.volatility
    const tangentLineContReturn = slope * tangentLineContVolatility + riskfreeValue

    const tangentLineContinued = {
      volatility: tangentLineContVolatility,
      return: tangentLineContReturn,
      name: tangentPoint.name
    }

    const userDefinedCML = {
      volatility: 0,
      return: this.state.riskfree,
      name: userLineName
    }

    portfolios.push(riskfreePoint, tangentPoint, tangentLineContinued, userDefinedCML)

    if (this.state.point != null) {

      const userTangentPoint = {
        volatility: this.state.point.x,
        return: this.state.point.y,
        name: userLineName
      }

      const userSlope = (this.state.point.y - this.state.riskfree) / this.state.point.x
      const userContReturn = userSlope * tangentLineContVolatility + this.state.riskfree

      const userLineContinued = {
        volatility: tangentLineContVolatility,
        return: userContReturn,
        name: userLineName
      }

      portfolios.push(userTangentPoint, userLineContinued)
    }

    //console.log(JSON.stringify(this.state.data, null, 2))

    let dataParsed = parseGroupingBy(portfolios, "volatility", "return", "name")

    return (
        <div>
          <div className="load-button">
            <label className="cml">
              CML:
              <input type="number" defaultValue={this.state.riskfree} min="0" max="0.3" step="0.001" onChange={this.updateCml} />
            </label>
            <button onClick={this.onClickLoadData}>Load Data From Server</button>
          </div>
          <div className="upload-button">
            <form onSubmit={this.uploadFormSubmit}>
              <input type="file" onChange={this.fileChange} />
              <button type="submit">Upload</button>
            </form>
          </div>
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
                //xMax="5"
                yMin={0}
                xDisplay={d3.format(".2f")}
                //yMax={1}
                onPointHover={this.onHoverLineChart}
                onPointClick={this.onClickLineChart}
                //showLegends
                legendPosition="bottom-right"
                data={dataParsed}
            />
          </div>
        </div>
    );
    }
}
