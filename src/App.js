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
      file: null
    }
    this.uploadFormSubmit = this.uploadFormSubmit.bind(this)
    this.fileChange = this.fileChange.bind(this)
    this.onClickLoadData = this.onClickLoadData.bind(this)
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
          loading: false
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
    console.log(e)
    if (e.target.files[0] != null ) {
        this.setState({file: e.target.files[0]})
      }
    else {
      this.setState({file: null})
    }
  }

  onClickLoadData() {
    this.setState({
      loading: true,
      data: '',
      error: false,
      file: null
    })
    getData().then((json) => {
      this.setState({
        data: json,
        loading: false
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

      const tangentLineContVolatility = portfolios[portfolios.length - 1].volatility
      const slope = (tangentPoint.return - riskfreeValue) / tangentPoint.volatility
      const tangentLineContReturn = slope * tangentLineContVolatility + riskfreeValue

      const tangentLineContinued = {
        volatility: tangentLineContVolatility,
        return: tangentLineContReturn,
        name: tangentPoint.name
      }

      portfolios.push(riskfreePoint, tangentPoint, tangentLineContinued)

      //console.log(JSON.stringify(this.state.data, null, 2))

      let dataParsed = parseGroupingBy(portfolios, "volatility", "return", "name")

        return (
            <div>
                <div className="upload-button">
                  <form onSubmit={this.uploadFormSubmit}>
                    <input type="file" onChange={this.fileChange} />
                    <button type="submit">Upload</button>
                  </form>
                </div>
              <div>
                  <button onClick={this.onClickLoadData}>Load Data From Server</button>
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
                        onPointHover={ (obj) =>
                            `return: ${obj.y}<br />`
                            + `deviation: ${obj.x}<br />`
                            + `sharpe: ${obj.sharpe}<br />`
                            + (obj.weights && obj.weights !== undefined
                                ? obj.weights.map(item => { return `${item.symbol}: ${item.weight}<br />` }).join('')
                                : '')
                        }
                        //showLegends
                        legendPosition="bottom-right"
                        data={dataParsed}
                    />
                </div>
            </div>
        );
    }
}
