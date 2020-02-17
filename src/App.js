import React, {Component} from 'react';
import Sketch from 'react-p5'

class App extends Component {
  data = [
      {"open":0.0000061740000000,"high":0.0000061800000000,"low":0.0000061500000000,"close":0.0000061650000000,"volume":18456.0000000000000000,"quoteVolume":0.11381034999999998,"btcVolume":0.11381034999999998,"usdVolume":835.5821146891371,"time": 1578265200000},
      {"open":0.0000061790000000,"high":0.0000061900000000,"low":0.0000061700000000,"close":0.0000061860000000,"volume":37966.0000000000000000,"quoteVolume":0.23462407000000005,"btcVolume":0.23462407000000005,"usdVolume":1725.9478814550812, "time": 1578267000000},
      {"open":0.0000061850000000,"high":0.0000062000000000,"low":0.0000061800000000,"close":0.0000061900000000,"volume":45085.0000000000000000,"quoteVolume":0.27906330000000007,"btcVolume":0.27906330000000007,"usdVolume":2057.642662279386,"time": 1578268800000},
  ]

  xRange = [1578265200000, 1578268800000]
  yRange = [0.0000061500000000, 0.0000062000000000]
  
  mouseX = null
  mouseY = null
  mouseDown = false
  candle_width = (1578268800000 - 1578265200000 ) / 2 * 0.9

  componentDidMount() {
    fetch("https://dev-api.shrimpy.io/v1/exchanges/coinbasepro/candles?quoteTradingSymbol=BTC&baseTradingSymbol=XLM&interval=1H")
    .then(res => res.json())
    .then(json => {
      let hData = []; let lData=[]; let tData=[];
      console.log(json)
      // json = json.filter((value, idx) => idx< 200)
      json.map((value, idx) => {
        json[idx]["open"] = Number(value["open"]);
        json[idx]["close"] = Number(value["close"]);
        json[idx]["high"] = Number(value["high"]);
        json[idx]["low"] = Number(value["low"]);
        json[idx]["time"] = new Date(value["time"]).getTime();
        hData.push(json[idx]["high"]); lData.push(json[idx]["low"]); tData.push(json[idx]["time"]) 
      })
      this.data = json; this.yRange = [Math.min(...lData), Math.max(...hData)]; this.xRange = [Math.min(...tData), Math.max(...tData)]
      this.candle_width = (this.xRange[1] - this.xRange[0]) / (this.data.length - 1) * 0.9
    }) 
  }
  
  render(){
    return (
      <div className="App">
        
          <Sketch
            setup={(p5, parentRef) => {
              p5.createCanvas(p5.windowWidth, p5.windowHeight-5).parent(parentRef);
            }}
            draw={p5 => {
              p5.background(0, 0, 30)
              p5.stroke(255, 255, 255)
              p5.fill(0, 0, 30)
              p5.rect(40, 40, p5.windowWidth - 80, p5.windowHeight -80)
              // draw grid
              // // y grid
              for (let x = p5.windowWidth - 140; x >= 40; x -= 40){
                p5.stroke(50)
                p5.line(x, p5.windowHeight - 80, x, 40)
              }
              // // x grid
              for (let y = p5.windowHeight - 80; y >= 40; y -= 40){
                p5.stroke(50)
                p5.line(p5.windowWidth - 140, y, 40, y)
              }
              // axis
              // // xaxis
              for (let i = 0; i < 11; i++){
                p5.fill(255, 255, 255)
                let iDate = new Date(this.xRange[0] + i * (this.xRange[1] - this.xRange[0]) / 10)
                p5.text(iDate.getHours() + ":" + iDate.getUTCMinutes() , 50 + i * (p5.windowWidth - 200) / 10, p5.windowHeight -60)
              }

              // // yaxis
              for (let j = 0; j < 11; j++){
                p5.fill(255, 255, 255)
                let value = this.yRange[0] + j * (this.yRange[1] - this.yRange[0]) / 10
                p5.text(value.toFixed(8), p5.windowWidth - 130, p5.windowHeight - 100 - j * (p5.windowHeight - 60 - 100) / 10) 
              }

              // chart data
              // // filtering
              let draw_data = this.data.filter(value => ( this.xRange[0] <= value.time && value.time <= this.xRange[1]) )
              if (draw_data.length > 0){
                let xRange_ratio = (p5.windowWidth - 200) / (this.xRange[1] - this.xRange[0])
                // // draw candlestick
                draw_data.forEach((value, index) => {
                  if (value.open > value.close)
                    p5.stroke(150, 0, 0)
                  else
                    p5.stroke(0, 150, 0)
                  
                  let hY = (p5.windowHeight - 160) / (this.yRange[1] - this.yRange[0]) * (this.yRange[1] - value.high) + 60
                  let lY = (p5.windowHeight - 160) / (this.yRange[1] - this.yRange[0]) * (this.yRange[1] - value.low) + 60
                  if (hY < 60) hY = 60; if (lY < 60) lY = 60;
                  if (hY > p5.windowHeight - 100) hY = p5.windowHeight - 100; if (lY > p5.windowHeight - 100) lY = p5.windowHeight - 100;

                  p5.line(
                    50 + (p5.windowWidth - 200) / (this.xRange[1] - this.xRange[0]) * (value.time - this.xRange[0]),
                    hY,
                    50 + (p5.windowWidth - 200) / (this.xRange[1] - this.xRange[0]) * (value.time - this.xRange[0]),
                    lY
                  )
                  if (value.open > value.close)
                    p5.fill(150, 0, 0)
                  else
                    p5.fill(0, 150, 0)
                  
                  let oY = (p5.windowHeight - 160) / (this.yRange[1] - this.yRange[0]) * (this.yRange[1] - value.open) + 60
                  let cY = (p5.windowHeight - 160) / (this.yRange[1] - this.yRange[0]) * (this.yRange[1] - value.close) + 60

                  if (oY < 60) oY = 60; if (cY < 60) cY = 60;
                  if (oY > p5.windowHeight - 100) oY = p5.windowHeight - 100; if (cY > p5.windowHeight - 100) cY = p5.windowHeight - 100;
                  
                  
                  p5.rect(
                    (index === 0 ) ? 50 + (p5.windowWidth - 200) / (this.xRange[1] - this.xRange[0]) * (value.time - this.xRange[0]) : 50 + (p5.windowWidth - 200) / (this.xRange[1] - this.xRange[0]) * (value.time - this.xRange[0]) - xRange_ratio * this.candle_width / 2,
                    oY,
                    (index === 0 || index === draw_data.length - 1) ? xRange_ratio * this.candle_width / 2 : xRange_ratio * this.candle_width,
                    cY-oY
                  )
                })
              }
              

              if (this.mouseX !== null && !this.mouseDown) {
                p5.stroke(180)
                p5.line(this.mouseX, 40, this.mouseX, p5.windowHeight - 80)
                p5.line(40, this.mouseY, p5.windowWidth - 140, this.mouseY)
              }

            }}
            windowResized={p5 => {
              p5.resizeCanvas(p5.windowWidth, p5.windowHeight - 5)
            }}
            mouseMoved={p5 => {
              this.mouseDown = false
              if (p5.mouseX > 45 && p5.mouseX < p5.windowWidth - 145 && p5.mouseY > 45 && p5.mouseY < p5.windowHeight - 85){
                p5.cursor('crosshair')
                this.mouseX = p5.mouseX; this.mouseY = p5.mouseY
              } else {
                p5.cursor('default')
                this.mouseX = null; this.mouseY = null;
              }
            }}
            mouseDragged={p5 => {
              this.mouseDown = true
              if (p5.mouseX > 45 && p5.mouseX < p5.windowWidth - 145 && p5.mouseY > 45 && p5.mouseY < p5.windowHeight - 85){
                p5.cursor('grabbing')
                let cvsXRange = p5.windowWidth - 200
                let cvsYRange = p5.windowHeight - 160
                let dateRange = this.xRange[1] - this.xRange[0]
                let valueRange = this.yRange[1] - this.yRange[0]
                
                this.xRange = [this.xRange[0] - dateRange / cvsXRange * (p5.mouseX - this.mouseX), this.xRange[1] - dateRange / cvsXRange * (p5.mouseX - this.mouseX)]
                this.yRange = [this.yRange[0] + valueRange / cvsYRange * (p5.mouseY - this.mouseY), this.yRange[1] + valueRange / cvsYRange * (p5.mouseY - this.mouseY)]
                this.mouseX = p5.mouseX; this.mouseY = p5.mouseY;
              
              } else if (p5.mouseX > p5.windowWidth - 155 && p5.mouseX < p5.windowWidth - 45) {
                p5.cursor('row-resize')
                let valueRange = this.yRange[1] - this.yRange[0]
                if (p5.mouseY > this.mouseY) {
                  this.yRange = [this.yRange[0] + valueRange * 0.05, this.yRange[1] - valueRange * 0.05 ]
                } else if (p5.mouseY < this.mouseY){
                  this.yRange = [this.yRange[0] - valueRange * 0.05, this.yRange[1] + valueRange * 0.05 ]
                }
                this.mouseX = p5.mouseX; this.mouseY = p5.mouseY;
              } else {
                
                this.mouseX = null; this.mouseY = null;
              }
            }}
            mouseWheel={(p5) => {
              let dateRange = this.xRange[1] - this.xRange[0]
              if (p5._pmouseWheelDeltaY < 0){
                p5.cursor('zoom-out')
                this.xRange = [this.xRange[0] - dateRange * 0.1, this.xRange[1] + dateRange * 0.1]
              } else if (p5._pmouseWheelDeltaY > 0){
                p5.cursor('zoom-in')
                this.xRange = [this.xRange[0] + dateRange * 0.1, this.xRange[1] - dateRange * 0.1]
              }
                
            }}
          />
      </div>
    )
  }
}

export default App;
