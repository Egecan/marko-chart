import React, { Component } from 'react';

import d3 from "d3";
import './App.css';
import LineChart from 'react-linechart';
import '../node_modules/react-linechart/dist/styles.css';
import { parseGroupingBy } from './utils/Parser';
import {
  getData, fileIsIncorrectFiletype, showInvalidFileTypeMessage, fileUpload, logErrorJson,
  pollServer, doesJsonHaveExpectedContent
} from './utils/DataService';

const jsonData = require('./testData/data4.json');


export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: jsonData,
      error: false,
      file: null,
      jsonfile: null,
      riskfree: 0.05,
      point: null,
      stocks: "CBA.AX,BHP.AX,TLS.AX",
      source: "yahoo",
      filetype: "uploadasync",
      minutes: 0
    }
    this.uploadFormSubmit = this.uploadFormSubmit.bind(this)
    this.fileChange = this.fileChange.bind(this)
    this.jsonFileChange = this.jsonFileChange.bind(this)
    this.uploadJson = this.uploadJson.bind(this)
    this.onClickLoadData = this.onClickLoadData.bind(this)
    this.onClickLineChart = this.onClickLineChart.bind(this)
    this.onHoverLineChart = this.onHoverLineChart.bind(this)
    this.updateCml = this.updateCml.bind(this)
    this.updateStocks = this.updateStocks.bind(this)
    this.updateSource = this.updateSource.bind(this)
    this.updateFileType = this.updateFileType.bind(this)
    this.downloadObjectAsJson = this.downloadObjectAsJson.bind(this)
    this.downloadSinglePoint = this.downloadSinglePoint.bind(this)
    this.pollServerForResult = this.pollServerForResult.bind(this)
    this.getLoadingMessage = this.getLoadingMessage.bind(this)
    this.updateMinutes = this.updateMinutes.bind(this)
  }

  pollServerForResult(uuid) {

    setTimeout(() => {

      pollServer(uuid).then((json) => {
        if (doesJsonHaveExpectedContent(json)) {
          logErrorJson(json)
          this.setState({
            data: json,
            loading: false,
            riskfree: json.CML.OptimalPorfolio.riskfree_ret
          })
        }
        else if (json.response && json.response.taskexists === false) {
          this.setState({
            error: true,
            loading: false
          })
        }
        else {
          this.pollServerForResult(uuid)
        }
      })
    }, 10000)
  }

  updateMinutes() {
    this.setState({
      minutes: ++this.state.minutes
    })
  }

  getLoadingMessage() {
    setTimeout(() => this.updateMinutes(), 60000);
    if (this.state.minutes === 0) {
      return "Processing request..."
    } else if (this.state.minutes === 1) {
      return "So far it has taken 1 minute, still processing..."
    } else {
      return "So far it has taken " + this.state.minutes + " minutes, still processing..."
    }
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
        error: false,
        point: null,
        minutes: 0
      })
      fileUpload(this.state.file, this.state.riskfree, this.state.filetype).then((json) => {
        if (this.state.filetype === "uploadasync") {
          const uuid = json.response.uid;
          this.pollServerForResult(uuid)
        }
        else {
          logErrorJson(json)
          this.setState({
            data: json,
            loading: false,
            riskfree: json.CML.OptimalPorfolio.riskfree_ret
          })
        }
      })
          .catch(error => {
            console.log(error)
            this.setState({
              loading: false,
              error: true
            })
          });
    }
  }
  fileChange(e) {
    if (e.target.files[0] != null ) {
      this.setState({file: e.target.files[0]})
      }
    else {
      this.setState({file: null})
    }
  }

  uploadJson(e){
    e.preventDefault()
    let jsonfile = JSON.parse(this.state.jsonfile)
    console.log(jsonfile)
    if(doesJsonHaveExpectedContent(jsonfile)) {
      this.setState({
        error: false,
        point: null,
        data: jsonfile,
        loading: false,
        riskfree: jsonfile.CML.OptimalPorfolio.riskfree_ret
      })
    } else {
      window.alert("Unexpected json format");
    }
  }

  jsonFileChange(e) {
    let file = e.target.files[0]
    if (file != null) {
      let that = this
      let reader = new FileReader();
      reader.onload = function (evt) {
        that.displayData(evt.target.result)
      }
      reader.readAsText(file)
    }
  }
  displayData(content) {
    this.setState({jsonfile: content});
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

  updateStocks(e) {
    console.log(e.target.value)
    this.setState({stocks:e.target.value})
  }

  updateSource(e) {
    console.log(e.target.value)
    this.setState({source:e.target.value})
  }

  updateFileType(e) {
    console.log(e.target.value)
    this.setState({filetype:e.target.value})
  }

  onClickLoadData() {
    this.setState({
      loading: true,
      data: '',
      error: false,
      file: null,
      jsonfile: null,
      point: null,
      minutes: 0
    })
    getData(this.state.riskfree, this.state.stocks, this.state.source).then((json) => {
      logErrorJson(json)
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

  downloadObjectAsJson(){
    if (this.state.data !== '') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.data, null, 2));
      let downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "export.json");
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }

  downloadSinglePoint(){
    if (this.state.point && this.state.point !== '') {
      let pointSaved = this.state.point
      pointSaved.weights.sort((a,b) => b.weight - a.weight)
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pointSaved, null, 2));
      let downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "selected-point.json");
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else {
      window.alert("Please pick a point to export from the graph first");
    }
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
        ? [].concat(obj.weights).sort((a,b) => b.weight - a.weight)
                .map(item => { return `${item.symbol}: ${item.weight}<br />` }).join('')
        : '')
    )
  }

  render() {

    if (this.state.loading) {
      return <h2>{this.getLoadingMessage()}</h2>
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
        sharpe: this.state.point.sharpe,
        weights: this.state.point.weights,
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
            <label className="stocks">
              Comma Separated Stocks List:
              <input type="text" value={this.state.stocks} onChange={this.updateStocks} />
            </label>
            <label className="stocks">
              Source:
            <select value={this.state.source} onChange={this.updateSource}>
              <option value="yahoo">yahoo</option>
              <option value="google">google</option>
            </select>
            </label>
            <button onClick={this.onClickLoadData}>Load Data From Server</button>
          </div>
          <div className="upload-button">
            <form onSubmit={this.uploadFormSubmit}>
              <input type="file" onChange={this.fileChange} />
              <label className="file-type">
                Upload Type:
                <select value={this.state.filetype} onChange={this.updateFileType}>
                  <option value="upload">upload</option>
                  <option value="upload1">upload1</option>
                  <option value="uploadasync">uploadasync</option>
                </select>
              </label>
              <button type="submit">Upload csv</button>
            </form>
          </div>
          <div className="upload-button">
            <form onSubmit={this.uploadJson}>
              <input type="file" onChange={this.jsonFileChange} />
              <button type="submit">Upload previously calculated JSON</button>
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
          <div className="single-dl-button">
            <button onClick={this.downloadSinglePoint}>Export Single Point</button>
          </div>
          <div className="download-button">
            <button onClick={this.downloadObjectAsJson}>Export Whole as JSON</button>
          </div>
        </div>
    );
    }
}
