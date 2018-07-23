import React, { Component } from 'react';
import './index.css';
import {quadrantsArr, getQuadrants, round} from './util';
export default class Drr extends React.Component {
    state=this.getInitStateFromProps();
    getInitStateFromProps() {
        const {
            y,
            x,
            w,
            h,
            angle,
            active
        } = this.props;
        return {
            top: y,
            left: x,
            width: w,
            height: h,
            rotateAngle: angle,
            enabled: active,
            dragging: false,
            resizing: false,
            rotating: false,
            handle: null,
            nowCursor: null, // 当前鼠标的指向
        };
    }
    render() {
        const {
            top,
            left,
            width,
            height,
            enabled,
            rotateAngle,
            dragging,
            resizing,
            rotating
        } = this.state;
        const {
            draggable,
            resizable,
            rotatable,
            dots,
            children,
            disabled
        } = this.props;
        const cls = `
            ${draggable && 'z-draggable'}
            ${resizable && 'z-resizable'}
            ${rotatable && 'z-rotatable'}
            ${enabled && !disabled && 'z-active'}
            ${dragging && 'z-dragging'}
            ${resizing && 'z-resizing'}
            ${rotating && 'z-rotating'}
        `;
        const style={
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: height + 'px',
            transform: 'rotate(' + rotateAngle + 'deg)'
        };
        const nowDotArr = quadrantsArr[getQuadrants(rotateAngle)]
        // console.log(getQuadrants(rotateAngle));
        return (
            <div
            ref={(e) => {this.$el=e;}}
            className={`z-drr-container ${cls}`}
            onMouseDown={(e) => {this.elmDown(e);}}
            onDoubleClick={this.handleDoubleClick}
            onClick={this.handleClick}
            style={style}>
                { children }
                { rotatable && 
                    <div
                    className="z-rotateable-handle"
                    style={{ display: enabled ? 'block' : 'none'}}
                    onMouseDown={(e) => {this.handleRotateStart(null, e);}}>
                    </div>
                }
                { resizable && dots.length > 0 && dots.map((handle, i) => {
                        return (
                            <div
                            key={i}
                            className={`z-resizeable-handle z-handle-${handle} cursor-${nowDotArr[i]}`}
                            // className={`z-resizeable-handle  cursor-${nowDotArr[i]}`}
                            style={{ display: enabled ? 'block' : 'none'}}
                            onMouseDown={($event) => {this.handleResizeStart(handle, nowDotArr[i],$event);}}
                            ></div>
                        );
                    })
                }
            </div>
        );
        
    }
    componentWillMount() {
        this.parentW = 9999;
        this.parentH = 9999;

        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.mouseOffX = 0;
        this.mouseOffY = 0;

        this.elmX = 0;
        this.elmY = 0;

        this.elmW = 0;
        this.elmH = 0;
        
    }
    componentDidMount() {
        document.documentElement.addEventListener('mousedown', this.deselect, true); // 捕获时执行，即先html，再到具体元素
        document.documentElement.addEventListener('mousemove', this.handleMove, true);
        document.documentElement.addEventListener('mouseup', this.handleUp, true);
        document.documentElement.addEventListener('keydown', this.handleKeyUp, true);

        this.elmX = parseInt(this.$el.style.left);
        this.elmY = parseInt(this.$el.style.top);
        this.elmW = this.$el.offsetWidth || this.$el.clientWidth;
        this.elmH = this.$el.offsetHeight || this.$el.clientHeight;

        this.reviewDimensions();
    }
    componentWillUnmount() {
        document.documentElement.removeEventListener('mousedown', this.deselect, true);
        document.documentElement.removeEventListener('mousemove', this.handleMove, true);
        document.documentElement.removeEventListener('mouseup', this.handleUp, true);
        document.documentElement.removeEventListener('keydown', this.handleKeyUp, true);
    }

    componentWillReceiveProps(nextProps) {
    }


    reviewDimensions = () => { // 重置宽高
        const {w, h, parent, x, y} = this.props;
        let {width, height} = this.state;
        if (this.minw > w) { // 超过 父级最小宽度限制
          width = this.minw;
        }
  
        if (this.minh > h) { // 超过父级最小高度
          height = this.minh;
        }
  
        if (parent) { // 限制大小在父级标签内
          const parentW = parseInt(this.$el.parentNode.clientWidth, 10);
          const parentH = parseInt(this.$el.parentNode.clientHeight, 10);
  
          this.parentW = parentW;
          this.parentH = parentH;
  
          if (w > parentW) {
            width = parentW;
          }
  
          if (h > parentH) {
            height = parentH;
          }
  
          if ((x + w) > parentW) {
            width = parentW - x;
          }
  
          if ((y + h) > parentH) {
            height = parentH - y;
          }
  
          this.elmW = width;
          this.elmH = height;

        }
        this.setState({width, height}); 
  
    }
    elmDown =(e) => {
        // console.log(e, 'elmDown');
        let {enabled, dragging, rotating} = this.state;
        const {draggable} = this.props;
        const target = e.target || e.srcElement;
        if (this.$el.contains(target)) {
            this.reviewDimensions();

            if (!enabled) {
            enabled = true;

            this.props.activated(); // 获得焦点
            this.props.updateActive(true);
            }
            if (draggable && e.target.className.indexOf('z-resizeable-handle') === -1 && e.target.className.indexOf('z-rotateable-handle') === -1 ) { // 可以拖动
            dragging = true;
            } else if (e.target.className.indexOf('z-rotateable-handle') > -1 ) {
                rotating = true;
            }
        }
        this.setState({enabled, dragging, rotating});
    }
    deselect = (e) => {
        const { draggable } = this.props;
        let {enabled} = this.state;
        if (this.$el.contains(e.target)) {
          draggable && e.preventDefault(); // 可以拖动时 防止拖动时文字被选中
        }
        this.lastMouseX = e.pageX || e.clientX + document.documentElement.scrollLeft; // 全局鼠标位置
        this.lastMouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
  
        const target = e.target || e.srcElement;
        const regex = new RegExp('z-handle-([nesw]{1, 2})', ''); // error
  
        // 点击在当前组件外，取消active状态
        // console.log(!this.$el.contains(target), '!this.$el.contains(target)')
        if (!this.$el.contains(target) && !regex.test(target.className)) {
          if (enabled) {
            enabled = false;
            this.props.deactivated();
            this.props.updateActive(false);
          }
        }
        this.setState({enabled});
    }
    handleDoubleClick = (e) => {
        this.props.dbClick(e);
    }
    handleClick = (e) => {
        this.props.click(e);
    }
    handleResizeStart = (handle, nowCursor, e) => {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        this.setState({handle, resizing: true, nowCursor});
    }
    handleRotateStart = (flog, e) => {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        this.setState({rotating: true});
    }
    getOrigin = () => {
        const rect = this.$el.getBoundingClientRect();
        return {
            x: (rect.left + rect.right) / 2,
            y: (rect.bottom + rect.top) / 2
        };
    }
    handleMove = (e) => {
        let {nowCursor, handle, rotating, dragging, resizing, left, top, width, height, rotateAngle} = this.state;
        const {minh, minw, grid, parent, axis, scale} = this.props;
        const lastMouseX = this.lastMouseX;
        const lastMouseY = this.lastMouseY;
        // 鼠标移动后pageX值
        const mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft;
        const mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;

        // 得出鼠标移动变化的位置值
        let diffX = (mouseX - this.lastMouseX + this.mouseOffX) * 1/scale; // 放大值越小，拖动距离越大
        let diffY = (mouseY - this.lastMouseY + this.mouseOffY) * 1/scale;
        // let diffX = (mouseX - this.lastMouseX + this.mouseOffX)
        // let diffY = (mouseY - this.lastMouseY + this.mouseOffY)

        this.mouseOffX = this.mouseOffY = 0;

        // 新的pageX值
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;

        // console.log(this.lastMouseX, this.lastMouseY, 'this.x.y')

        const dX = diffX;
        const dY = diffY;


        // console.log(dX, 'dx');
        if (resizing) {
            const dushu = (Math.PI / 180) * rotateAngle, cos = Math.cos(dushu), sin = Math.sin(dushu);
            // console.log(cos, sin);
            if (nowCursor.indexOf('n') >= 0) {
                if (this.elmH - dY < minh) {
                    diffY = this.elmH - minh;
                } else if (this.elmY + dY < 0) {
                    diffY = -this.elmY;
                }
                this.mouseOffY = dY - diffY;
                this.elmY += diffY;
                this.elmH -= diffY;
                }

            if (nowCursor.indexOf('s') >= 0) {
                if (this.elmH + dY < minh) {
                    diffY = minh - this.elmH;
                } else if (this.elmY + this.elmH + dY > this.parentH) {
                    diffY = this.parentH - this.elmY - this.elmH;
                }
                this.mouseOffY = dY - diffY;
                this.elmH += diffY;
            }

            if (nowCursor.indexOf('w') >= 0) {
                if (this.elmW - dX < minw) {
                    diffX = this.elmW - minw;
                } else if (this.elmX + dX < 0) {
                    diffX = -this.elmX;
                }
                this.mouseOffX = dX - diffX;
                this.elmX += diffX;
                this.elmW -= diffX;
            }

            if (nowCursor.indexOf('e') >= 0) {
                if (this.elmW + dX < minw) {
                    diffX = minw - this.elmW;
                } else if (this.elmX + this.elmW + dX > this.parentW) {
                    diffX = this.parentW - this.elmX - this.elmW;
                }
                this.mouseOffX = dX - diffX;
                // console.log(diffX, 'this.mouseOffX')
                // this.elmW += (sin === 0 ?diffX : diffX*Math.abs(sin));
                // console.log(this.elmW, 'this.elmW')
                this.elmW += diffX;
            }

            left = round(this.elmX, 4);
            top = round(this.elmY, 4);

            width = round(this.elmW, 4);
            height = round(this.elmH, 4);

            this.setState({left, top, width, height});
            this.props.resizing(left, top, width, height);
        } else if (dragging) {
            if (parent) {
                if (this.elmX + dX < 0) { // 判断元素是否将移出左侧
                    diffX = -this.elmX;
                } else if (this.elmX + this.elmW + dX > this.parentW) { // 判断元素是否将移出右侧
                    diffX = this.parentW - this.elmX - this.elmW;
                }
                if (this.elmY + dY < 0) {
                    diffY = -this.elmY;
                } else if (this.elmY + this.elmH + dY > this.parentH) {
                    diffY = this.parentH - this.elmY - this.elmH;
                }
                this.mouseOffX = dX - diffX;
                this.mouseOffY = dY - diffY;
            }

            this.elmX += diffX;
            this.elmY += diffY;

            if (axis === 'x' || axis === 'both') {
            left = round(this.elmX, 4)
            }
            if (axis === 'y' || axis === 'both') {
            // top = (Math.round(this.elmY / grid[1]) * grid[1]);
            top = round(this.elmY, 4);
            }
            this.setState({left, top});
            this.props.dragging(left, top);
        } else if (rotating) {
            const origin = this.getOrigin(); // 获取中心点
            const lastAngle = Math.atan2(lastMouseY - origin.y, lastMouseX - origin.x); // 上一次鼠标距离中心点的斜率
            const currentAngle = Math.atan2(mouseY - origin.y, mouseX - origin.x); // 本次斜率
            const diffAngle = Math.round((currentAngle - lastAngle) * 180 / Math.PI);
            rotateAngle += diffAngle; // 转成角度

            // 不存在负数
            if( rotateAngle >= -360 && rotateAngle < 0) {
                rotateAngle+=360;
            } else if (rotateAngle >= 360 && rotateAngle < 721) {
                rotateAngle-=360;
            }
            this.props.rotating(rotateAngle);
            this.setState({rotateAngle});
            

        }
    }
    handleUp = (e) => {
        let {rotating, dragging, resizing, left, top, width, height, rotateAngle} = this.state;
        if (resizing) {
            resizing = false;
            this.props.resizestop(left, top, width, height);
        }
        if (dragging) {
            dragging = false;
            this.props.dragstop(left, top);
        }

        if (rotating) {
            rotating = false;
            this.props.rotatestop(rotateAngle);
        }

        this.elmX = left;
        this.elmY = top;

        this.setState({
            handle: null,rotating, dragging, resizing
        });
    }
    handleKeyUp = (e) => {
        let isie = (document.all) ? true:false;
        let key;
        let ev;
        if(isie){
            key = window.event.keyCode;
            ev = window.event;
        }else{
            key = e.which;
            ev = e;
        }
        if(key==46 || key == 8){
            if (this.state.enabled) {
                this.props.del();
            }
        }
    }
}

Drr.defaultProps = {
    dots: ['nw', 'n','ne', 'e','se','s', 'sw', 'w'],
    active: false,
    draggable: true,
    resizable: true,
    rotatable: true,
    w: 200,
    h: 200,
    minw: 50,
    minh: 50,
    angle: 0,
    x: 0,
    y: 0,
    axis: 'both',
    grid: [1,1],
    parent: false,
    deactivated: () => {},
    rotatestop: () => {},
    dragstop: () => {},
    resizestop: () => {},
    rotating: () => {},
    dragging: () => {},
    resizing: () => {},
    activated: () => {},
    updateActive: () => {},
    dbClick: () => {},
    click: () => {},
    scale: 1,
    del: () => {},
    disabled: false
}
