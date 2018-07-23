import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Drr from './Drr'

class App extends Component {
  state={
    left: 0,
    top: 0,
    width: 200,
    zIndex: 2,
    height: 200,
    rotate: 0,
    minw: 100,
    minh: 100
  }
  render() {

    const {width, height, left, top, rotate, minw, minh} = this.state;
    return (
      <div className="App">
        <Drr
          w={width}
          h={height}
          y={top}
          x={left}
          angle={rotate}
          minw={minw || 100}
          minh={minh || 100}
          dragging={(x, y) => {this.handleDragging(x, y);}}
          resizing={(x, y, w, h) => {this.handleResizing(x, y, w, h);}}
          rotating={(an) => {this.handleRotating(an);}}
          click={(e) => this.handleClick(e)}
          active={false}
          draggable={true}
          rotatable={true}
          resizable={true}
          >
          <div className="test"
          >变形组件测试</div>
        </Drr>
      </div>
    );
  }
  // 拖拽
  handleDragging (x, y) {
    console.log(x, y);
    // this.setState({top: y, left: x})
  }
  // 旋转
  handleRotating (angle) {
    console.log(angle, 'ange');
  }
  // 缩放
  handleResizing (x, y, w, h) {
    console.log(x, y, w, h);
  }
  // 点击
  handleClick (event) {
    console.log(event, event.target);
  }
}

export default App;
