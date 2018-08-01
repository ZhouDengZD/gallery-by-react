require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';
var imageDatas = require('../data/imagesData.json');

// let yeomanImage = require('../images/yeoman.png');
//获取图片地址是使用url-loader

//获取图片数据，将图片名信息转为图片URL路径信息
imageDatas =(function getImageURL(imageDatasArr){
  for(var i = 0,j = imageDatasArr.length; i<j ;i++){
    var singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/'+singleImageData.fileName);
    // 为图片添加imageURL属性
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

// 获取区间内的一个随机值
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
}

//获取0-30度之间的任意正负值
function get30DegRandom(){
  return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);
}

class ImgFigure extends React.Component {
  //imgFigure的点击处理函数:点中间位置图片，翻转。其他位置图片：居中。
  constructor(){
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }

  render(){
    let styleObj = {};

    // 如果prop中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    // 如果图片的旋转角度有值且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['Moztransform','msTransform','WebkitTransform','OTransform','transform']).forEach(value=>{
        // styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
        styleObj[value] = `rotate(${this.props.arrange.rotate}deg)`;
      })
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }//避免中间图片被遮住

    var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';
        //注意:样式是拼接，所以要有空格

    return(
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className='img-back' onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
}

//控制组件
class ControllerUnit extends React.Component{
  constructor(){
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e){
    //如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应图片居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }
  render(){
    let controllerUnitclassName = 'controller-unit';
    //如果对应的是居中图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter){
      controllerUnitclassName += ' is-center';
      //如果同时对应的是翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        controllerUnitclassName += ' is-inverse';
      }
    }
    return(
      <span className={controllerUnitclassName} onClick={this.handleClick}></span>
    );
  }
}

//大管家组件
class AppComponent extends React.Component {
  //AppComponent作为大管家掌控数据及数据的转换（图片定位控制、旋转控制、反面等）
  constructor(){
    super();
    this.Constant = { //存储可排布的取值范围
      renterPos:{
        left:0,
        right:0
      },
      hPosRange:{  //水平方向的取值范围
        leftSecx:[0,0], //左分区
        rightSex:[0,0],
        y:[0,0]
      },
      vPosRange:{
        topY:[0,0],
        x:[0,0]
      }
    }
    this.state={
      imgsArrangeArr:[
        // {
        //   pos:{
        //     left:'0',
        //     top:'0'
        //   },
        //  rotate:0   //旋转角度
        // },
        //  isInverse:false  //图片正反面,默认false，正面
        //  isCenter:false   //默认不居中
      ]
    }
  }

  //翻转图片
  //@param index输入当前被执行inverse操作的图片对应的图片信息数组的index值
  //@return {function} 这是一个闭包函数，其内返回一个真正待被执行的函数
  inverse(index){
    return ()=>{
      let imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr:imgsArrangeArr
      })
    }
  }

  //利用rearrange函数居中对应index的图片（非中间图片点击时会移动到中间）
  //@param index:需要居中的图片对应的图片信息数组的index值
  //@return {function}
  center(index){
    return ()=>{
      this.rearrange(index);
    }
  }

   //用于布局所有图片
   rearrange(centerIndex){  //centerIndex指定需要居中的图片的index
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecx = hPosRange.leftSecx,
        hPosRangeRightSecx = hPosRange.rightSex,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),//上侧取0-1张图片

        topImgSpliceIndex = 0,//记录上侧的这张图片是从数组那个位置拿出来的，初始化为0
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);   // 存放居中图片的状态信息
        //从centerIndex起剔除一个，即拿到了centerIndex位置的图片的状态信息

        //首先居中centerIndex的图片,居中图片不需要旋转
        imgsArrangeCenterArr[0]={
          pos : centerPos,
          rotate : 0,
          isCenter : true
        }

        //取出要布局上侧的图片的状态信息（从索引位置往后取）
        topImgSpliceIndex = Math.ceil( Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice( topImgSpliceIndex, topImgNum);
        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function(value,index){
          imgsArrangeTopArr[index]={
            pos:{
              top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
              left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
            },
            rotate:get30DegRandom(),
            isCenter:false
          }
        });

        // 布局左右两侧的图片
        for(let i = 0, j = imgsArrangeArr.length, k = j /2 ;i < j ; i++){
          let hPosRangeLORX = null;

          // 前半部分布局左边，后半部分布局右边
          if(i < k){
            hPosRangeLORX = hPosRangeLeftSecx;
          }else{
            hPosRangeLORX =hPosRangeRightSecx;
          }
          imgsArrangeArr[i]={
            pos:{
              top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
              left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
            },
            rotate:get30DegRandom(),
            isCenter:false
          }
        }
        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){ //取了一个元素填充中间
          imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
          //将之前取出来的填充回去
        }
        imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);//将中间的填充回去

        this.setState({
          imgsArrangeArr:imgsArrangeArr
        });
   }

  //组件加载后，为每张图片计算其位置的范围
  componentDidMount(){
    //可通过this.refs.name索引到ref="name"的子组件
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        //scrollWidth:对象实际内容宽度，不含滚动条等边线宽度，会随对象中内容超过可视区域后而变大
        //clientWidth:对象内容的可视区的宽度，不含滚动条等边线宽度，会随对象显示大小的变化而改变
        //offsetWidth：对象整体的实际宽度，含滚动条等边线宽度，会随对象显示大小的变化而改变
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW/2),
        halfStageH = Math.ceil(stageH/2);

        //拿到第一个imgFigure的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left:halfStageW -halfImgW,
      top:halfStageH- halfImgH
    }
    //计算左侧右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecx[0] = - halfImgW; //最小取值
    this.Constant.hPosRange.leftSecx[1] = halfStageW - halfImgW * 3;  //最大取值

    this.Constant.hPosRange.rightSex[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSex[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH- halfImgH;
    //计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);//让第一张图片居中
  }

  render() {
    let controllerUnits=[];
    let  imgFigures=[];   //存放图片组件

    imageDatas.forEach((value,index)=>{
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        }//初始化状态，将图片都定位到左上角（随意布局在rearrange函数中处理）
      }
      imgFigures.push(<ImgFigure data={value} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} key={index}/>)
      //value为单张图片数据,arrange将每张图片的状态信息传递给了ImgFigure组件
      //this.inserve(index)执行,返回一个闭包函数给inverse属性
      controllerUnits.push(<ControllerUnit arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} key={index}/>);
    }); //将所有图片组件放入一个数组

  //控制每个图片组件的位置

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <section className="controller-nav">
          {controllerUnits}
        </section>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
